import { Observable, TimeoutError, filter, merge, of, retry, switchMap, take, throwError, timeout } from 'rxjs';

import { GenericErrorInboundMessage, IDisposable, ILogger } from '../../../types';
import { IQueueTask } from './i-queue-task';
import { IChannel } from '../i-channel';
import { formatMessageForDump } from '../../../helpers';
import { GenericError } from '../../../errors';
import { ITaskVisitor } from './i-task-visitor';

export class TaskQueue implements IDisposable {
    private readonly queue: Array<IQueueTask<unknown>> = [];

    constructor(
        private readonly channel: IChannel,
        private readonly messageSendTimeout: number,
        private readonly maxMessageSendRetries: number,
        private readonly logger: ILogger,
        private readonly genericErrorsStream: Observable<GenericErrorInboundMessage>,
        private readonly taskVisitor: ITaskVisitor
    ) {
    }

    public enqueueTask(
        task: IQueueTask<unknown>
    ): void {
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

    public dispose(): Observable<void> {
        return new Observable<void>((observer) => {
            this.queue.forEach((i) => i.discard());
            this.queue.splice(0, this.queue.length);
            observer.complete();
        });
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
            task.dispose().subscribe();
        }
    }

    private createRetryConfig(
        task: IQueueTask<unknown>
    ): (error: Error, retryCount: number) => Observable<unknown> {
        return (error: Error, retryCount: number): Observable<unknown> => {
            if (error instanceof TimeoutError) {
                if (retryCount >= this.maxMessageSendRetries) {
                    this.logMaxRetriesReachedError(task);
                    return throwError(() => error);
                }
                this.logTimeoutError(task);
                return of(null);
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
