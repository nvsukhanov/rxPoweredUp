import { Observable, Subject, Subscription, of, take } from 'rxjs';

import { IDisposable, PortOutputCommandFeedback, PortOutputCommandFeedbackInboundMessage, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { MessageType, OutboundMessageTypes } from '../../constants';
import { IMessageMiddleware, IOutboundMessenger, PortCommandExecutionStatus } from '../../hub';
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

    private isDisposed = false;

    constructor(
        private readonly portOutputCommandFeedbackStream: Observable<PortOutputCommandFeedbackInboundMessage>,
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
        this.queue.forEach((i) => {
            if (i.type === TaskType.portOutputCommand) {
                i.outputStream.next(PortCommandExecutionStatus.Discarded);
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

    private handlePortOutputCommandFeedback(
        feedbackMessage: PortOutputCommandFeedbackInboundMessage
    ): void {
        // The feedback can include information about two port output commands simultaneously - the last one that was sent and the one that
        // was discarded by that last command.

        // Here we filter the queue to find the commands that correspond to the feedback message
        // (in the feedback stream there can be messages from other ports as well)
        const commandTasksFromQueue = this.queue.filter(item => {
            return item.type === TaskType.portOutputCommand && item.message.portId === feedbackMessage.portId;
        }) as TaskPortOutputCommandQueueItem[];

        // If feedback tells us that some command has reached it's terminal state, we
        // 1. Assume that terminal state corresponds to the first port output command in the queue that has an InProgress or Send state
        // (because sometimes commands can transition to terminal state without being "in progress")
        // 2. Emit the corresponding status to the command's output stream
        // 3. Remove the command from the queue
        if (this.isFeedbackTerminal(feedbackMessage.feedback)) {
            const terminalStatus = this.mapFeedbackToTerminalStatus(feedbackMessage.feedback);
            const command = commandTasksFromQueue.find(item => item.state === TaskState.inProgress || item.state === TaskState.waitingForResponse);
            if (command) {
                command.outputStream.next(terminalStatus);
                command.outputStream.complete();
                this.removeCommandFromQueue(command);
            } else {
                // TODO: graceful error handling
                throw new Error('Completed feedback received but no command were in progress');
            }
        }

        // If feedback tells us that some command is is process - we
        // 1. Assume that the command is the first port output command in the queue that has a Sent state (not InProgress yet)
        // 2. Set the command's state to InProgress
        // 3. Emit the InProgress status to the command's output stream
        if (this.isFeedbackInProgress(feedbackMessage.feedback)) {
            const command = commandTasksFromQueue.find(item => item.state === TaskState.waitingForResponse);
            if (command) {
                command.state = TaskState.inProgress;
                command.outputStream.next(PortCommandExecutionStatus.InProgress);
            } else {
                // TODO: graceful error handling
                throw new Error('InProgress feedback received but no command were waiting for feedback');
            }
        }
    }

    private isFeedbackInProgress(
        feedback: PortOutputCommandFeedback
    ): boolean {
        return feedback.bufferEmptyCommandInProgress;
    }

    private isFeedbackTerminal(
        feedback: PortOutputCommandFeedback
    ): boolean {
        return feedback.bufferEmptyCommandCompleted || feedback.currentCommandDiscarded || feedback.executionError;
    }

    private mapFeedbackToTerminalStatus(
        feedback: PortOutputCommandFeedback
    ): PortCommandExecutionStatus.Completed | PortCommandExecutionStatus.Discarded | PortCommandExecutionStatus.ExecutionError {
        // somehow busyOrFull is a terminal state, in contrast to the docs and it's name
        if (feedback.bufferEmptyCommandCompleted || feedback.busyOrFull) {
            return PortCommandExecutionStatus.Completed;
        }
        if (feedback.currentCommandDiscarded) {
            return PortCommandExecutionStatus.Discarded;
        }
        if (feedback.executionError) {
            return PortCommandExecutionStatus.ExecutionError;
        }
        throw new Error('Feedback is not terminal');
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
