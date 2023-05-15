import { Observable, Subject, of } from 'rxjs';

import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IMessageMiddleware, IOutboundMessenger } from '../../hub';
import { PacketBuilder } from './packet-builder';

type QueueItem<TResponse> = {
    message: RawMessage<MessageType>,
    internalResponses$: Observable<TResponse>,
    outerResponses$: Subject<TResponse>,
}

export class OutboundMessenger implements IOutboundMessenger {
    private queue: QueueItem<unknown>[] = [];

    private isRunning = false;

    constructor(
        private readonly characteristic: BluetoothRemoteGATTCharacteristic,
        private readonly packetBuilder: PacketBuilder,
        private readonly messageMiddleware: IMessageMiddleware[],
    ) {
    }

    public sendWithoutResponse(
        message: RawMessage<MessageType>,
    ): Observable<void> {
        return this.sendWithResponse(message, of(void 0));
    }

    public sendWithResponse<TResponse>(
        message: RawMessage<MessageType>,
        responseStream: Observable<TResponse>,
    ): Observable<TResponse> {
        const responsesSubject = new Subject<TResponse>();

        this.queue.push({
            message,
            internalResponses$: responseStream,
            outerResponses$: responsesSubject as Subject<unknown>
        });

        if (!this.isRunning) {
            this.runExecution();
        }

        return responsesSubject;
    }

    private runExecution(): void {
        const task = this.queue.shift();

        if (!task) {
            this.isRunning = false;
            return;
        }

        this.isRunning = true;

        this.messageMiddleware.reduce((acc, middleware) => middleware.handle(acc), task.message);
        const packet = this.packetBuilder.buildPacket(task.message);

        // sometimes we receive the response from hub BEFORE the then() callback of writeValueWithoutResponse is called
        // (hub replies faster than microtask queue is processed?)
        const earlyRepliesCollection: Array<unknown> = [];
        const earlyCollectSubscription = task.internalResponses$.subscribe((v) => {
            earlyRepliesCollection.push(v);
        });

        this.characteristic.writeValueWithoutResponse(
            packet
        ).catch((e) => {
            task.outerResponses$.error(e);
            task.outerResponses$.complete();
            return true;
        }).then((isErrorEncountered) => {
            earlyCollectSubscription.unsubscribe();

            if (isErrorEncountered) {
                this.runExecution();
                return;
            }

            earlyRepliesCollection.forEach((r) => {
                task.outerResponses$.next(r);
            });

            const sub = task.internalResponses$.subscribe({
                next: (v) => {
                    // We should not complete the outerResponses$ here since first reply is not always the last one
                    // i.g. portCommand task can send multiple replies (in_progress -> busy)
                    task.outerResponses$.next(v);
                    // After receiving the first response from the hub, we can start the next task.
                    // If we don't wait for the first response and start the next task immediately,
                    // the hub will never send the response for the first task and API behavior will be broken
                    this.runExecution();
                },
                complete: () => {
                    task.outerResponses$.complete();
                },
                error: (e) => {
                    task.outerResponses$.error(e);
                    sub.unsubscribe();
                    this.runExecution();
                }
            });
        });
    }
}
