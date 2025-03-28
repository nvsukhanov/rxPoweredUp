import { injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { TaskQueueFactory } from './task-queue-factory';
import { ITaskVisitor } from './i-task-visitor';
import { IChannel } from '../i-channel';
import type { GenericErrorInboundMessage, ILogger } from '../../../types';

@injectable()
export class TaskQueueFactoryFactory {
  public create(
    channel: IChannel,
    messageSendTimeout: number,
    maxMessageSendAttempts: number,
    initialMessageSendRetryDelay: number,
    logger: ILogger,
    genericErrorsStream: Observable<GenericErrorInboundMessage>,
    taskVisitor: ITaskVisitor
  ): TaskQueueFactory {
    return new TaskQueueFactory(channel, messageSendTimeout, maxMessageSendAttempts, initialMessageSendRetryDelay, logger, genericErrorsStream, taskVisitor);
  }
}
