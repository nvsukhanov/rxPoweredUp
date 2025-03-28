import { Observable, bufferCount, concatWith, map } from 'rxjs';

import type { IDisposable, ILogger, LastOfTuple, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { OutboundMessageTypes } from '../../constants';
import { IOutboundMessenger, PortCommandExecutionStatus, WithResponseSequenceItem } from '../../hub';
import { IQueueTask, TaskQueue, TaskQueueFactory } from './queue';
import { TaskPortOutputCommand, TaskWithResponse, TaskWithoutResponse } from './queue-tasks';

export class OutboundMessenger implements IOutboundMessenger, IDisposable {
  private isDisposed = false;

  private readonly genericTaskQueue: TaskQueue;

  private portOutputCommandTaskQueues = new Map<number, TaskQueue>();

  constructor(private readonly taskQueueFactory: TaskQueueFactory, private readonly logger: ILogger) {
    this.genericTaskQueue = this.taskQueueFactory.createTaskQueue();
  }

  public sendWithoutResponse(message: RawMessage<OutboundMessageTypes>): Observable<void> {
    const task = new TaskWithoutResponse(message);
    return this.createExecutionStreamForTask(task, this.genericTaskQueue);
  }

  public sendWithResponse<
    TSequenceItems extends [...Array<WithResponseSequenceItem<unknown>>, WithResponseSequenceItem<unknown>],
    TResult extends LastOfTuple<TSequenceItems> extends WithResponseSequenceItem<infer R> ? R : never
  >(...sequenceItems: TSequenceItems): Observable<TResult> {
    const tasks = sequenceItems.map(({ message, reply }) => new TaskWithResponse(message, reply));
    const executionStreams: Array<Observable<unknown>> = tasks.map((task) => this.createExecutionStreamForTask(task, this.genericTaskQueue));

    if (executionStreams.length === 1) {
      return executionStreams[0] as Observable<TResult>;
    } else {
      return executionStreams[0].pipe(
        concatWith(...executionStreams.slice(1)),
        bufferCount(sequenceItems.length),
        map((r) => r.at(-1) as TResult)
      );
    }
  }

  public sendPortOutputCommand(message: RawPortOutputCommandMessage): Observable<PortCommandExecutionStatus> {
    const task = new TaskPortOutputCommand(message);
    return this.createExecutionStreamForTask(task, this.getQueueForPort(task.portId));
  }

  public createExecutionStreamForTask<TTaskResult>(task: IQueueTask<TTaskResult>, queue: TaskQueue): Observable<TTaskResult> {
    let isEnqueued = false;
    return new Observable((observer) => {
      if (this.isDisposed) {
        observer.error(new Error('Outbound messenger is disposed'));
        return;
      }
      if (!isEnqueued) {
        queue.enqueueTask(task);
        isEnqueued = true;
      }
      const sub = task.result.subscribe(observer);
      return () => sub.unsubscribe();
    });
  }

  public dispose(): void {
    if (this.isDisposed) {
      throw new Error('Already disposed');
    }
    this.isDisposed = true;
    this.genericTaskQueue.dispose();
    for (const queue of this.portOutputCommandTaskQueues.values()) {
      queue.dispose();
    }
    this.logger.debug('Outbound messenger disposed');
  }

  private getQueueForPort(portId: number): TaskQueue {
    let queue = this.portOutputCommandTaskQueues.get(portId);
    if (!queue) {
      queue = this.taskQueueFactory.createTaskQueue();
      this.portOutputCommandTaskQueues.set(portId, queue);
    }
    return queue;
  }
}
