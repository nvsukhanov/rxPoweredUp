import { BehaviorSubject, EMPTY, Observable, Subject, Subscription, filter, from, of, switchMap, take } from 'rxjs';

import { IQueueTask, ITaskVisitor } from '../queue';
import { RawMessage } from '../../../types';
import { OutboundMessageTypes } from '../../../constants';
import { IChannel } from '../i-channel';

/**
 * This class represents a task that is responsible for sending a single message to the hub that is expected to receive a response.
 * e.g. requesting a hub property value
 */
export class TaskWithResponse<TResponse> implements IQueueTask<TResponse> {
    public readonly result: Subject<TResponse>;

    private readonly completed = new BehaviorSubject<boolean>(false);

    private earlyResponseCaptureSubscription?: Subscription;

    constructor(
        public readonly message: RawMessage<OutboundMessageTypes>,
        private responsesStream: Observable<TResponse>,
    ) {
        this.result = new Subject<TResponse>();
    }

    public discard(): void {
        this.result.complete();
    }

    public accept(
        visitor: ITaskVisitor
    ): void {
        visitor.visitTaskWithResponse(this);
    }

    public dispose(): Observable<void> {
        return new Observable<void>((observer) => {
            this.earlyResponseCaptureSubscription?.unsubscribe();
            observer.complete();
            return () => void 0;
        });
    }

    public emitError(
        error: Error
    ): void {
        this.result.error(error);
        this.earlyResponseCaptureSubscription?.unsubscribe();
        this.completed.complete();
    }

    public execute(
        channel: IChannel
    ): Observable<unknown> {
        this.earlyResponseCaptureSubscription?.unsubscribe();
        // We should start listening for replies BEFORE we send the message,
        // because sometimes we receive feedback before the sending promise is resolved
        // (hub responds faster then microtask queue is processed?)
        this.earlyResponseCaptureSubscription = this.responsesStream.pipe(
            take(1), // we expect exactly one response for each message sent
        ).subscribe({
            next: (response) => {
                // On receiving a response we should re-emit it to the output stream and complete it
                this.result.next(response);
                this.result.complete();
                this.completed.next(true);
            },
            error: (error) => {
                // On receiving an error we should re-emit it to the output stream and complete it
                this.result.error(error);
                this.result.complete();
                this.completed.next(true);
            },
            complete: () => {
                // On receiving a completion signal we should re-emit it to the output stream and complete it
                this.result.complete();
                this.completed.next(true);
            }
        });

        if (this.completed.value) {
            return EMPTY;
        } else {
            return of(null).pipe(
                switchMap(() => from(channel.sendMessage(this.message))),
                switchMap(() => this.completed),
                filter((v) => v),
                take(1),
            );
        }
    }
}
