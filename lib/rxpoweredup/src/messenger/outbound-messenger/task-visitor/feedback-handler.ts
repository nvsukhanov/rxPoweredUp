import { injectable } from 'tsyringe';

import { PortOutputCommandFeedback } from '../../../types';
import { PortOutputCommandTaskState, TaskPortOutputCommand } from '../queue-tasks';
import { PortCommandExecutionStatus } from '../../../hub';

/**
 * Updates the state of the corresponding task based on the feedback from the hub.
 */
@injectable()
export class FeedbackHandler {
  private readonly inProgressOrWaitingForResponse: ReadonlySet<PortOutputCommandTaskState> = new Set([
    PortOutputCommandTaskState.inProgress,
    PortOutputCommandTaskState.waitingForResponse,
  ]);

  private readonly waitingForResponse: ReadonlySet<PortOutputCommandTaskState> = new Set([
    PortOutputCommandTaskState.waitingForResponse,
  ]);

  public handlePortOutputCommandFeedback(
    commands: ReadonlyArray<TaskPortOutputCommand>,
    feedback: PortOutputCommandFeedback
  ): void {
    // The feedback can hold information about multiple port output commands simultaneously,
    // that's why we should iterate over all of them and try to find the corresponding task in the queue.

    // We should find the first task that is in progress OR waiting for response
    // (in case of response that transition task to 'discarded' state, completely skipping 'inProgress' state)
    // and make it discarded, then remove from queue
    if (feedback.currentCommandDiscarded) {
      const command = this.getFirstPortOutputCommandWithMatchingState(commands, this.inProgressOrWaitingForResponse);
      command?.setExecutionStatus(PortCommandExecutionStatus.discarded);
    }
    if (feedback.bufferEmptyCommandCompleted) {
      // We should find the first task that is in progress OR waiting for response
      // (in case of response that transition task to 'completed', skipping 'inProgress' state)
      // and make it completed, then remove from queue
      const command = this.getFirstPortOutputCommandWithMatchingState(commands, this.inProgressOrWaitingForResponse);
      command?.setExecutionStatus(PortCommandExecutionStatus.completed);
    }
    if (feedback.busyOrFull) {
      // weird, somehow that indicates that all remaining tasks are completed
      // That state indicates that there are no more tasks in the queue,
      // so we can mark all remaining tasks as completed and truncate the queue
      commands.forEach((t) => {
        t.setExecutionStatus(PortCommandExecutionStatus.completed);
      });
    }
    if (feedback.executionError) {
      // That state indicates that the task that was sent to the hub cannot be executed.
      const command = this.getFirstPortOutputCommandWithMatchingState(commands, this.inProgressOrWaitingForResponse);
      command?.setExecutionStatus(PortCommandExecutionStatus.executionError);
    }
    if (feedback.bufferEmptyCommandInProgress) {
      // That state indicates that the task that was sent to the hub was accepted and is being executed.
      const command = this.getFirstPortOutputCommandWithMatchingState(commands, this.waitingForResponse);
      if (command) {
        command.state = PortOutputCommandTaskState.inProgress;
        command.setExecutionStatus(PortCommandExecutionStatus.inProgress);
      }
    }
  }

  private getFirstPortOutputCommandWithMatchingState(
    commands: ReadonlyArray<TaskPortOutputCommand>,
    states: ReadonlySet<PortOutputCommandTaskState>
  ): TaskPortOutputCommand | undefined {
    return commands.find((t) => states.has(t.state));
  }
}
