import { Observable } from 'rxjs';

import { TaskQueue } from './task-queue';
import { IChannel } from '../i-channel';
import type { GenericErrorInboundMessage, ILogger } from '../../../types';
import { ITaskVisitor } from './i-task-visitor';

export class TaskQueueFactory {
  constructor(
    private readonly channel: IChannel,
    private readonly messageSendTimeout: number,
    private readonly maxMessageSendAttempts: number,
    private readonly initialMessageSendRetryDelay: number,
    private readonly logger: ILogger,
    private readonly genericErrorsStream: Observable<GenericErrorInboundMessage>,
    private readonly taskVisitor: ITaskVisitor
  ) {}

  public createTaskQueue(): TaskQueue {
    return new TaskQueue(
      this.channel,
      this.messageSendTimeout,
      this.maxMessageSendAttempts,
      this.initialMessageSendRetryDelay,
      this.logger,
      this.genericErrorsStream,
      this.taskVisitor
    );
  }
}
