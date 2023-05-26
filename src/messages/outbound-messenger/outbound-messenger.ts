import {
    Observable,
    ReplaySubject,
    Subject,
    Subscription,
    TimeoutError,
    bufferCount,
    catchError,
    concatWith,
    from,
    map,
    of,
    retry,
    switchMap,
    take,
    takeUntil,
    timeout
} from 'rxjs';

import { IDisposable, ILogger, LastOfTuple, PortOutputCommandFeedbackInboundMessage, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { GenericErrorCode, MessageType, OutboundMessageTypes } from '../../constants';
import { GenericError, IMessageMiddleware, IOutboundMessenger, OutboundMessengerConfig, PortCommandExecutionStatus, WithResponseSequenceItem } from '../../hub';
import { PacketBuilder } from './packet-builder';
import { formatMessageForDump } from '../../helpers';

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
    executionStream: Observable<TResponse>;
}

type TaskWithoutResponseQueueItem = {
    type: TaskType.withoutResponse;
    message: RawMessage<OutboundMessageTypes>;
    state: TaskState.pending;
    outputStream: Subject<void>;
    executionStream: Observable<void>;
}

type TaskPortOutputCommandQueueItem = {
    type: TaskType.portOutputCommand;
    message: RawPortOutputCommandMessage;
    state: TaskState;
    outputStream: ReplaySubject<PortCommandExecutionStatus>;
    executionStream: Observable<PortCommandExecutionStatus>;
}

export class OutboundMessenger implements IOutboundMessenger, IDisposable { // TODO: decompose this class into smaller pieces
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
        private readonly logger: ILogger,
        private readonly config: OutboundMessengerConfig
    ) {
    }

    public sendWithoutResponse(
        message: RawMessage<OutboundMessageTypes>
    ): Observable<void> {
        let isQueued = false;

        const queueItem: TaskWithoutResponseQueueItem = {
            type: TaskType.withoutResponse,
            message,
            state: TaskState.pending,
            outputStream: new ReplaySubject<void>(1),
            executionStream: new Observable<void>((observer) => {
                if (!isQueued) {
                    this.enqueueCommand(queueItem);
                    isQueued = true;
                }
                const sub = queueItem.outputStream.subscribe(observer);
                return () => sub.unsubscribe();
            })
        };

        return queueItem.executionStream;
    }

    sendWithResponse<
        TSequenceItems extends [ ...Array<WithResponseSequenceItem<unknown>>, WithResponseSequenceItem<unknown> ],
        TResult extends LastOfTuple<TSequenceItems> extends WithResponseSequenceItem<infer R> ? R : never
    >(
        ...sequenceItems: TSequenceItems
    ): Observable<TResult> {
        const executionStreams: Array<Observable<unknown>> = [];
        sequenceItems.forEach(({ message, reply }) => {
            let isQueued = false;

            const queueItem: TaskWithResponseQueueItem<unknown> = {
                type: TaskType.withResponse,
                message,
                state: TaskState.pending,
                inputStream: reply,
                outputStream: new ReplaySubject<unknown>(1),
                executionStream: new Observable<unknown>((observer) => {
                    if (!isQueued) {
                        this.enqueueCommand(queueItem as TaskWithResponseQueueItem<unknown>);
                        isQueued = true;
                    }
                    const sub = queueItem.outputStream.subscribe(observer);
                    return () => sub.unsubscribe();
                })
            };
            executionStreams.push(queueItem.executionStream);
        });
        if (executionStreams.length === 1) {
            return executionStreams[0] as Observable<TResult>;
        } else {
            return executionStreams[0].pipe(
                concatWith(...executionStreams.slice(1)),
                bufferCount(sequenceItems.length),
                map((r) => r.at(-1) as TResult),
            );
        }
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

        const outputStream = new ReplaySubject<PortCommandExecutionStatus>(1);
        let isQueued = false;

        const queueItem: TaskPortOutputCommandQueueItem = {
            type: TaskType.portOutputCommand,
            message,
            state: TaskState.pending,
            outputStream,
            executionStream: new Observable<PortCommandExecutionStatus>((observer) => {
                if (!isQueued) {
                    this.enqueueCommand(queueItem);
                    isQueued = true;
                }
                const sub = outputStream.subscribe(observer);
                return () => sub.unsubscribe();
            })
        };

        return queueItem.executionStream;
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
            ).subscribe({
                next: () => this.executeCommand(command),
                error: () => this.executeCommand(command)
            });
        } else {
            this.executeCommand(command);
        }
    }

    private executeCommand(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>
    ): void {
        if (this.isDisposed) {
            return;
        }
        switch (command.type) {
            case TaskType.portOutputCommand:
                this.executePortOutputCommand(command);
                break;
            case TaskType.withResponse:
                this.executeCommandWithResponse(command);
                break;
            case TaskType.withoutResponse:
                this.executeCommandWithoutResponse(command);
                break;
        }
    }

    private executePortOutputCommand(
        command: TaskPortOutputCommandQueueItem
    ): void {
        command.state = TaskState.waitingForResponse;
        of(null).pipe(
            switchMap(() => from(this.sendMessage(command.message)).pipe(
                switchMap(() => this.portOutputCommandFeedbackStream)
            )),
            timeout(this.config.messageSendTimeout),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logTimeoutError(command);
                }
                throw e;
            }),
            retry(this.config.maxMessageSendRetries),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logMaxRetriesReachedError(command);
                }
                throw e;
            }),
            take(1)
        ).subscribe({
            error: (e) => {
                this.removeCommandFromQueue(command);
                command.outputStream.error(e);
                command.outputStream.complete();
            }
        });
    }

    private executeCommandWithoutResponse(
        command: TaskWithoutResponseQueueItem
    ): void {
        of(null).pipe(
            switchMap(() => this.sendMessage(command.message)),
            timeout(this.config.messageSendTimeout),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logger.warn(`timeout: ${formatMessageForDump(command.message)}`);
                }
                throw e;
            }),
            retry(this.config.maxMessageSendRetries),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logMaxRetriesReachedError(command);
                }
                throw e;
            }),
            take(1)
        ).subscribe({
            next: () => {
                this.removeCommandFromQueue(command);
                command.outputStream.next(void 0);
                command.outputStream.complete();
            },
            error: (e) => {
                this.removeCommandFromQueue(command);
                command.outputStream.error(e);
                command.outputStream.complete();
            }
        });
    }

    private executeCommandWithResponse(
        command: TaskWithResponseQueueItem<unknown>
    ): void {
        command.state = TaskState.waitingForResponse;

        const earlyStreamCapture = new ReplaySubject<unknown>(1);
        const errorReceived = new Subject<Error>();

        // We should start listening for replies BEFORE we send the message,
        // because sometimes we receive feedback before the sending promise is resolved
        // (hub responds faster then microtask queue is processed?)
        command.inputStream.pipe(
            takeUntil(errorReceived),
            take(1) // we expect exactly one response for each message sent
        ).subscribe((response) => {
            earlyStreamCapture.next(response);
            // On receiving a response we should re-emit it to the output stream and complete it
            this.removeCommandFromQueue(command);
            command.outputStream.next(response);
            command.outputStream.complete();
        });

        of(null).pipe(
            switchMap(() => from(this.sendMessage(command.message)).pipe(
                switchMap(() => earlyStreamCapture),
            )),
            timeout(this.config.messageSendTimeout),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logTimeoutError(command);
                }
                throw e;
            }),
            retry(this.config.maxMessageSendRetries),
            catchError((e) => {
                if (e instanceof TimeoutError) {
                    this.logMaxRetriesReachedError(command);
                }
                throw e;
            }),
            take(1)
        ).subscribe({
            error: (e) => {
                this.removeCommandFromQueue(command);
                command.outputStream.error(e);
                command.outputStream.complete();
                errorReceived.next(e);
            }
        });
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
        message: RawMessage<MessageType>,
    ): Promise<void> {
        if (this.isDisposed) {
            throw new Error('Cannot send message - messenger is disposed');
        }
        const resultingMessage = this.messageMiddleware.reduce((acc, middleware) => middleware.handle(acc), message);
        const packet = this.packetBuilder.buildPacket(resultingMessage);

        return this.characteristic.writeValueWithoutResponse(packet);
    }

    private logTimeoutError(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>,
    ): void {
        this.logger.warn(`send timeout: ${formatMessageForDump(command.message)}`);
    }

    private logMaxRetriesReachedError(
        command: TaskPortOutputCommandQueueItem | TaskWithoutResponseQueueItem | TaskWithResponseQueueItem<unknown>,
    ): void {
        this.logger.error(`failed to send ${formatMessageForDump(command.message)}`);
    }
}
