import { Observable, Subject, Subscription, of, take } from 'rxjs';

import { IDisposable, PortOutputCommandFeedbackInboundMessage, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { GenericErrorCode, MessageType, OutboundMessageTypes } from '../../constants';
import { GenericError, IMessageMiddleware, IOutboundMessenger, PortCommandExecutionStatus } from '../../hub';
import { PacketBuilder } from './packet-builder';

// TaskWithoutResponseQueueItem state transitions:
// pending -> terminal state: [sent]

// TaskWithResponseQueueItem state transitions:
// pending -> sent
// sent -> waitingForResponse
// waitingForResponse -> terminal state [Response received]

// TaskPortOutputCommandQueueItem state transitions:
// pending -> sent
// sent -> inProgress
// sent -> terminal state: [Discarded]
// sent -> terminal state: [Completed]
// sent -> terminal state: [Execution error]
// inProgress -> terminal state: [Discarded]
// inProgress -> terminal state: [Completed]
// inProgress -> terminal state: [Execution error]

enum TaskState {
    pending,
    waitingForResponse,
    inProgress
}

enum TaskType {
    portOutputCommand,
    withResponse,
    withoutResponse
}

type TaskWithResponseQueueItem<TResponse> = {
    type: TaskType.withResponse;
    message: RawMessage<OutboundMessageTypes>;
    state: TaskState.pending | TaskState.waitingForResponse;
    inputStream: Observable<TResponse>;
    outputStream: Subject<TResponse>;
}

type TaskWithoutResponseQueueItem = {
    type: TaskType.withoutResponse;
    message: RawMessage<OutboundMessageTypes>;
    state: TaskState.pending;
    outputStream: Subject<void>;
}

type TaskPortOutputCommandQueueItem = {
    type: TaskType.portOutputCommand;
    message: RawPortOutputCommandMessage;
    state: TaskState;
    outputStream: Subject<PortCommandExecutionStatus>;
}

export class OutboundMessenger implements IOutboundMessenger, IDisposable {
    private readonly queue: Array<TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>> = [];

    private feedbackHandlingSubscription?: Subscription;

    private genericErrorsSubscription?: Subscription;

    private isDisposed = false;

    constructor(
        private readonly portOutputCommandFeedbackStream: Observable<PortOutputCommandFeedbackInboundMessage>,
        private readonly genericErrorsStream: Observable<GenericError>,
        private readonly characteristic: BluetoothRemoteGATTCharacteristic,
        private readonly packetBuilder: PacketBuilder,
        private readonly messageMiddleware: ReadonlyArray<IMessageMiddleware>,
    ) {
    }

    public sendWithoutResponse(
        message: RawMessage<OutboundMessageTypes>
    ): Observable<void> {
        const queueItem: TaskWithoutResponseQueueItem = {
            type: TaskType.withoutResponse,
            message,
            state: TaskState.pending,
            outputStream: new Subject<void>()
        };

        this.enqueueCommand(queueItem);
        return queueItem.outputStream;
    }

    public sendWithResponse<TResponse>(
        message: RawMessage<OutboundMessageTypes>,
        responseStream: Observable<TResponse>,
    ): Observable<TResponse> {
        const queueItem: TaskWithResponseQueueItem<TResponse> = {
            type: TaskType.withResponse,
            message,
            state: TaskState.pending,
            inputStream: responseStream,
            outputStream: new Subject<TResponse>()
        };
        this.enqueueCommand(queueItem as TaskWithResponseQueueItem<unknown>);
        return queueItem.outputStream;
    }

    public sendPortOutputCommand(
        message: RawPortOutputCommandMessage,
    ): Observable<PortCommandExecutionStatus> {
        if (!this.feedbackHandlingSubscription) {
            this.feedbackHandlingSubscription = this.portOutputCommandFeedbackStream.subscribe((feedback) => {
                this.handlePortOutputCommandFeedback(feedback);
            });
        }

        if (!this.genericErrorsSubscription) {
            this.genericErrorsSubscription = this.genericErrorsStream.subscribe((error) => {
                this.handleGenericError(error);
            });
        }

        const queueItem: TaskPortOutputCommandQueueItem = {
            type: TaskType.portOutputCommand,
            message,
            state: TaskState.pending,
            outputStream: new Subject<PortCommandExecutionStatus>()
        };

        this.enqueueCommand(queueItem);
        return queueItem.outputStream;
    }

    public dispose(): Observable<void> {
        if (this.isDisposed) {
            throw new Error('Already disposed');
        }
        this.isDisposed = true;
        this.feedbackHandlingSubscription?.unsubscribe();
        this.genericErrorsSubscription?.unsubscribe();
        this.queue.forEach((i) => {
            if (i.type === TaskType.portOutputCommand) {
                i.outputStream.next(PortCommandExecutionStatus.discarded);
                i.outputStream.complete();
            } else {
                i.outputStream.complete();
            }
        });
        this.queue.splice(0, this.queue.length);
        return of(void 0);
    }

    private enqueueCommand(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>
    ): void {
        const lastCommand = this.queue.at(-1);

        this.queue.push(command);

        if (lastCommand) {
            // We should ensure that the next command is sent strictly AFTER the previous one has received ANY feedback.
            // Not doing so will result in a broken queue (we won't be able to map feedback to executed tasks correctly).
            (lastCommand.outputStream as Observable<unknown>).pipe(
                // Assuming that here would be some reply or termination state.
                // In case of TaskWithoutResponse it will be an empty emission.
                take(1)
            ).subscribe(() => {
                this.executeCommand(command);
            });
        } else {
            this.executeCommand(command);
        }
    }

    private executeCommand(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>
    ): void {
        switch (command.type) {
            case TaskType.portOutputCommand:
                // This comes earlier than the actual sending
                // because sometimes we receive feedback before the sending promise is resolved
                // (hub responds faster then microtask queue is processed?)
                command.state = TaskState.waitingForResponse;
                if (this.isDisposed) {
                    return;
                }
                this.sendMessage(command.message);
                break;
            case TaskType.withResponse:
                command.state = TaskState.waitingForResponse;
                if (this.isDisposed) {
                    return;
                }
                // We should start listening for replies BEFORE we send the message,
                // because sometimes we receive feedback before the sending promise is resolved
                // (hub responds faster then microtask queue is processed?)
                command.inputStream.pipe(
                    take(1) // we expect exactly one response for each message sent
                ).subscribe((response) => {
                    // On receiving a response we should re-emit it to the output stream and complete it
                    this.removeCommandFromQueue(command);
                    command.outputStream.next(response);
                    command.outputStream.complete();
                });
                this.sendMessage(command.message);
                break;
            case TaskType.withoutResponse:
                this.sendMessage(command.message).then(() => {
                    this.removeCommandFromQueue(command);
                    command.outputStream.next(void 0);
                    command.outputStream.complete();
                });
                break;
        }
    }

    private handleGenericError(
        error: GenericError
    ): void {
        // There is a little information about generic error in documentation, so the implementation is intuitive
        switch (error.code) {
            case GenericErrorCode.commandNotRecognized:
            case GenericErrorCode.bufferOverflow:
            case GenericErrorCode.invalidUse:
            case GenericErrorCode.timeout:
                this.terminateTaskByGenericErrors(error.commandType);
                break;
        }
    }
    
    private terminateTaskByGenericErrors(
        commandType: MessageType
    ): void {
        const command = this.queue.find((t) => t.state === TaskState.waitingForResponse && t.message.header.messageType === commandType);
        if (command) {
            switch (command.type) {
                case TaskType.portOutputCommand:
                    command.outputStream.next(PortCommandExecutionStatus.executionError);
                    command.outputStream.complete();
                    break;
                case TaskType.withResponse:
                    command.outputStream.error(new Error('Command not recognized'));
                    break;
                case TaskType.withoutResponse:
                    command.outputStream.error(new Error('Command not recognized'));
                    break;
            }
            this.removeCommandFromQueue(command);
        }
    }

    private handlePortOutputCommandFeedback(
        feedbackMessage: PortOutputCommandFeedbackInboundMessage
    ): void {
        // The feedback can hold information about multiple port output commands simultaneously,
        // that's why we should iterate over all of them and try to find the corresponding task in the queue.
        // Method seems too complicated. // TODO: move queue to a separate class, use strategy pattern for different feedback types

        // We should find the first task that is in progress OR waiting for response
        // (in case of response that transition task to 'discarded' state, completely skipping 'inProgress' state)
        // and make it discarded, then remove from queue
        if (feedbackMessage.feedback.currentCommandDiscarded) {
            const command = this.getPortTasksFromQueue(feedbackMessage.portId)
                                .find((t) => t.state === TaskState.inProgress || t.state === TaskState.waitingForResponse);
            if (command) {
                command.outputStream.next(PortCommandExecutionStatus.discarded);
                command.outputStream.complete();
                this.removeCommandFromQueue(command);
            }
        }
        if (feedbackMessage.feedback.bufferEmptyCommandCompleted) {
            // We should find the first task that is in progress OR waiting for response
            // (in case of response that transition task to 'completed', skipping 'inProgress' state)
            // and make it completed, then remove from queue
            const command = this.getPortTasksFromQueue(feedbackMessage.portId)
                                .find((t) => t.state === TaskState.inProgress || t.state === TaskState.waitingForResponse);
            if (command) {
                command.outputStream.next(PortCommandExecutionStatus.completed);
                command.outputStream.complete();
                this.removeCommandFromQueue(command);
            }
        }
        if (feedbackMessage.feedback.busyOrFull) { // weird, somehow that indicates that all remaining tasks are completed
            // That state indicates that there are no more tasks in the queue,
            // so we can mark all remaining tasks as completed and truncate the queue
            this.getPortTasksFromQueue(feedbackMessage.portId).forEach((t) => {
                t.outputStream.next(PortCommandExecutionStatus.completed);
                t.outputStream.complete();
            });
            this.queue.splice(0, this.queue.length);
        }
        if (feedbackMessage.feedback.executionError) {
            // That state indicates that the task that was sent to the hub cannot be executed.
            const command = this.getPortTasksFromQueue(feedbackMessage.portId)
                                .find((t) => t.state === TaskState.inProgress || t.state === TaskState.waitingForResponse);
            if (command) {
                command.outputStream.next(PortCommandExecutionStatus.executionError);
                command.outputStream.complete();
                this.removeCommandFromQueue(command);
            }
        }
        if (feedbackMessage.feedback.bufferEmptyCommandInProgress) {
            // That state indicates that the task that was sent to the hub was accepted and is being executed.
            const command = this.getPortTasksFromQueue(feedbackMessage.portId)
                                .find((t) => t.state === TaskState.waitingForResponse);
            if (command) {
                command.state = TaskState.inProgress;
                command.outputStream.next(PortCommandExecutionStatus.inProgress);
            }
        }
    }

    private getPortTasksFromQueue(
        portId: number
    ): TaskPortOutputCommandQueueItem[] {
        return this.queue.filter(item => {
            return item.type === TaskType.portOutputCommand && item.message.portId === portId;
        }) as TaskPortOutputCommandQueueItem[];
    }

    private removeCommandFromQueue(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>
    ): void {
        this.queue.splice(this.queue.findIndex((c) => c === command), 1);
    }

    private sendMessage(
        message: RawMessage<MessageType>
    ): Promise<void> {
        if (this.isDisposed) {
            throw new Error('Cannot send message - messenger is disposed');
        }
        const resultingMessage = this.messageMiddleware.reduce((acc, middleware) => middleware.handle(acc), message);
        const packet = this.packetBuilder.buildPacket(resultingMessage);

        // We ignore returned promise here because we strictly rely on feedback.
        return this.characteristic.writeValueWithoutResponse(packet);
    }
}
