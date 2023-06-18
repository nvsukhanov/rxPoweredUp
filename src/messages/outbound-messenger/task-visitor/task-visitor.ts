import { Observable, Subscription } from 'rxjs';

import { ITaskVisitor } from '../queue';
import { TaskPortOutputCommand } from '../queue-tasks';
import { PortOutputCommandFeedbackInboundMessage } from '../../../types';
import { FeedbackHandler } from './feedback-handler';

/**
 * A visitor that handles port output command tasks.
 * It subscribes to the feedback stream and handles the feedback messages.
 */
export class TaskVisitor implements ITaskVisitor {
    private commands = new Map<number, TaskPortOutputCommand[]>();

    private readonly subscription = new Subscription();

    constructor(
        private readonly feedbackStream: Observable<PortOutputCommandFeedbackInboundMessage>,
        feedbackHandler: FeedbackHandler
    ) {
        this.subscription.add(this.feedbackStream.subscribe((message) => feedbackHandler.handlePortOutputCommandFeedback(
            this.commands.get(message.portId) ?? [],
            message.feedback
        )));
    }

    public visitTaskPortOutputCommand(
        task: TaskPortOutputCommand
    ): void {
        const portCommands = this.commands.get(task.portId);
        if (!portCommands) {
            this.commands.set(task.portId, [ task ]);
        } else {
            portCommands.push(task);
        }
        task.result.subscribe({
            complete: () => this.removePortOutputCommand(task),
            error: () => this.removePortOutputCommand(task)
        });
    }

    public visitTaskWithResponse(): void {
        return void 0;
    }

    public visitTaskWithoutResponse(): void {
        return void 0;
    }

    public dispose(): Observable<void> {
        return new Observable<void>((observer) => {
            this.subscription.unsubscribe();
            observer.complete();
            return () => void 0;
        });
    }

    private removePortOutputCommand(
        task: TaskPortOutputCommand
    ): void {
        const portCommands = this.commands.get(task.portId);
        if (!portCommands) {
            return;
        }
        if (portCommands.length === 1) {
            this.commands.delete(task.portId);
            return;
        }
        const index = portCommands.indexOf(task);
        if (index >= 0) {
            portCommands.splice(index, 1);
        }
    }
}
