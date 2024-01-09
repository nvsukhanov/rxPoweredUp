import { Observable, TimeoutError, filter, merge, of, retry, switchMap, take, throwError, timeout, timer } from 'rxjs';

import type { GenericErrorInboundMessage, IDisposable, ILogger } from '../../../types';
import { IQueueTask } from './i-queue-task';
import { IChannel } from '../i-channel';
import { formatMessageForDump } from '../../../helpers';
import { GenericError } from '../../../errors';
import { ITaskVisitor } from './i-task-visitor';

export class TaskQueue implements IDisposable {
    private isDisposed = false;

    private readonly queue: Array<IQueueTask<unknown>> = [];

    constructor(
        private readonly channel: IChannel,
        private readonly messageSendTimeout: number,
        private readonly maxMessageSendAttempts: number,
        private readonly initialMessageSendRetryDelay: number,
        private readonly logger: ILogger,
        private readonly genericErrorsStream: Observable<GenericErrorInboundMessage>,
        private readonly taskVisitor: ITaskVisitor
    ) {
    }

    public enqueueTask(
        task: IQueueTask<unknown>
    ): void {
        if (this.isDisposed) {
            throw new Error('Task queue is already disposed');
        }
        task.accept(this.taskVisitor);
        const lastTask = this.queue.at(-1);
        this.queue.push(task);
        if (lastTask) {
            // We should ensure that the next command is sent strictly AFTER the previous one has received ANY feedback.
            // Not doing so will result in a broken queue (we won't be able to map feedback to executed tasks correctly).
            lastTask.result.subscribe({
                complete: () => this.executeTask(task),
                error: () => this.executeTask(task)
            });
        } else {
            this.executeTask(task);
        }
    }

    public dispose(): void {
        if (this.isDisposed) {
            throw new Error('Task queue is already disposed');
        }
        this.isDisposed = true;
        this.queue.forEach((i) => {
            i.discard();
            i.dispose();
        });
        this.queue.splice(0, this.queue.length);
        this.logger.debug('Task queue disposed');
        this.taskVisitor.dispose();
    }

    private executeTask(
        task: IQueueTask<unknown>
    ): void {
        of(null).pipe(
            switchMap(() => {
                return merge(
                    task.execute(this.channel),
                    this.genericErrorsStream.pipe(
                        filter((e) => e.commandType === task.message.header.messageType),
                        switchMap((error: GenericErrorInboundMessage) => {
                            return throwError(() => new GenericError(error.code, error.commandType));
                        })
                    )
                );
            }),
            timeout(this.messageSendTimeout),
            retry({ delay: this.createRetryConfig(task) }),
            take(1)
        ).subscribe({
            complete: () => {
                this.removeTaskFromQueue(task);
            },
            error: (e: Error) => {
                task.emitError(e);
                this.removeTaskFromQueue(task);
            }
        });
    }

    private removeTaskFromQueue(
        task: IQueueTask<unknown>
    ): void {
        const index = this.queue.indexOf(task);
        if (index >= 0) {
            this.queue.splice(index, 1);
            task.dispose();
        }
    }

    private createRetryConfig(
        task: IQueueTask<unknown>
    ): (error: Error, retryCount: number) => Observable<unknown> {
        return (error: Error, retryCount: number): Observable<unknown> => {
            if (error instanceof TimeoutError) {
                if (retryCount >= this.maxMessageSendAttempts) {
                    this.logMaxRetriesReachedError(task);
                    return throwError(() => error);
                }
                this.logTimeoutError(task);
                const delayMs = Math.pow(2, retryCount - 1) * this.initialMessageSendRetryDelay;
                return timer(delayMs);
            }
            return throwError(() => error);
        };
    }

    private logTimeoutError(
        task: IQueueTask<unknown>,
    ): void {
        this.logger.warn(`send timeout: ${formatMessageForDump(task.message)}, will retry`);
    }

    private logMaxRetriesReachedError(
        task: IQueueTask<unknown>,
    ): void {
        this.logger.error(`failed to send ${formatMessageForDump(task.message)}`);
    }
}
