import { Observable, bufferCount, concatWith, map } from 'rxjs';

import { IDisposable, LastOfTuple, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { OutboundMessageTypes } from '../../constants';
import { IOutboundMessenger, PortCommandExecutionStatus, WithResponseSequenceItem } from '../../hub';
import { IQueueTask, TaskQueue } from './queue';
import { TaskPortOutputCommand, TaskWithResponse, TaskWithoutResponse } from './queue-tasks';

export class OutboundMessenger implements IOutboundMessenger, IDisposable {
    private isDisposed = false;

    constructor(
        private readonly tasksQueue: TaskQueue,
    ) {
    }

    public sendWithoutResponse(
        message: RawMessage<OutboundMessageTypes>
    ): Observable<void> {
        const task = new TaskWithoutResponse(message);
        return this.createExecutionStreamForTask(task);
    }

    public sendWithResponse<
        TSequenceItems extends [ ...Array<WithResponseSequenceItem<unknown>>, WithResponseSequenceItem<unknown> ],
        TResult extends LastOfTuple<TSequenceItems> extends WithResponseSequenceItem<infer R> ? R : never
    >(
        ...sequenceItems: TSequenceItems
    ): Observable<TResult> {
        const tasks = sequenceItems.map(({ message, reply }) => new TaskWithResponse(message, reply));
        const executionStreams: Array<Observable<unknown>> = tasks.map((task) => this.createExecutionStreamForTask(task));

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
        const task = new TaskPortOutputCommand(message);
        return this.createExecutionStreamForTask(task);
    }

    public createExecutionStreamForTask<TTaskResult>(
        task: IQueueTask<TTaskResult>
    ): Observable<TTaskResult> {
        let isEnqueued = false;
        return new Observable((observer) => {
            if (!isEnqueued) {
                this.tasksQueue.enqueueTask(task);
                isEnqueued = true;
            }
            const sub = task.result.subscribe(observer);
            return () => sub.unsubscribe();
        });
    }

    public dispose(): Observable<void> {
        return new Observable((observer) => {
            if (this.isDisposed) {
                throw new Error('Already disposed');
            }
            this.isDisposed = true;
            this.tasksQueue.dispose();
            observer.next(void 0);
            observer.complete();
        });
    }
}
