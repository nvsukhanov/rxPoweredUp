import { Observable } from 'rxjs';

import { TaskQueue } from './task-queue';
import { IChannel } from '../i-channel';
import { GenericErrorInboundMessage, ILogger } from '../../../types';
import { ITaskVisitor } from './i-task-visitor';

export class TaskQueueFactory {
    constructor(
        private readonly channel: IChannel,
        private readonly messageSendTimeout: number,
        private readonly maxMessageSendRetries: number,
        private readonly logger: ILogger,
        private readonly genericErrorsStream: Observable<GenericErrorInboundMessage>,
        private readonly taskVisitor: ITaskVisitor
    ) {
    }

    public createTaskQueue(): TaskQueue {
        return new TaskQueue(
            this.channel,
            this.messageSendTimeout,
            this.maxMessageSendRetries,
            this.logger,
            this.genericErrorsStream,
            this.taskVisitor
        );
    }
}
