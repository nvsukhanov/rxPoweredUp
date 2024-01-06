import { Observable } from 'rxjs';
import { injectable } from 'tsyringe';

import { ILogger, PortOutputCommandFeedbackInboundMessage } from '../../../types';
import { ITaskVisitor } from '../queue';
import { TaskVisitor } from './task-visitor';
import { FeedbackHandler } from './feedback-handler';

@injectable()
export class TaskVisitorFactory {
    constructor(
        private readonly feedbackHandler: FeedbackHandler
    ) {
    }

    public createFeedbackHandler(
        feedback: Observable<PortOutputCommandFeedbackInboundMessage>,
        logger: ILogger
    ): ITaskVisitor {
        return new TaskVisitor(
            feedback,
            logger,
            this.feedbackHandler
        );
    }
}
