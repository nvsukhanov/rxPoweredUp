import { Observable } from 'rxjs';
import { injectable } from 'tsyringe';

import { PortOutputCommandFeedbackInboundMessage } from '../../../types';
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
        feedback: Observable<PortOutputCommandFeedbackInboundMessage>
    ): ITaskVisitor {
        return new TaskVisitor(
            feedback,
            this.feedbackHandler
        );
    }
}
