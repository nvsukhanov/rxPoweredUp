import { injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { TaskQueue } from './task-queue';
import { IChannel } from '../i-channel';
import { GenericErrorInboundMessage, ILogger } from '../../../types';
import { ITaskVisitor } from './i-task-visitor';

@injectable()
export class TaskQueueFactory {
    public createTaskQueue(
        channel: IChannel,
        messageSendTimeout: number,
        maxMessageSendRetries: number,
        logger: ILogger,
        genericErrorsStream: Observable<GenericErrorInboundMessage>,
        taskVisitor: ITaskVisitor
    ): TaskQueue {
        return new TaskQueue(
            channel,
            messageSendTimeout,
            maxMessageSendRetries,
            logger,
            genericErrorsStream,
            taskVisitor
        );
    }
}
