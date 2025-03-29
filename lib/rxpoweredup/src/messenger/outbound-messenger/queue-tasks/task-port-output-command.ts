import { Observable, ReplaySubject, from, of, switchMap, take, tap } from 'rxjs';

import { IQueueTask, ITaskVisitor } from '../queue';
import { PortCommandExecutionStatus } from '../../../hub';
import { RawPortOutputCommandMessage } from '../../../types';
import { IChannel } from '../i-channel';

export enum PortOutputCommandTaskState {
  pending,
  waitingForResponse,
  inProgress,
}

/**
 * This class represents a task that is responsible for sending a single port output command to the hub.
 */
export class TaskPortOutputCommand implements IQueueTask<PortCommandExecutionStatus> {
  public readonly result = new ReplaySubject<PortCommandExecutionStatus>();

  private _state = PortOutputCommandTaskState.pending;

  private readonly responseReceived = new ReplaySubject<boolean>(1);

  private terminalExecutionStates: ReadonlySet<PortCommandExecutionStatus> = new Set([
    PortCommandExecutionStatus.completed,
    PortCommandExecutionStatus.discarded,
    PortCommandExecutionStatus.executionError,
  ]);

  private stateTransitions: ReadonlyMap<PortOutputCommandTaskState, PortOutputCommandTaskState> = new Map([
    [PortOutputCommandTaskState.pending, PortOutputCommandTaskState.waitingForResponse],
    [PortOutputCommandTaskState.waitingForResponse, PortOutputCommandTaskState.inProgress],
    // backwards transition is possible when the hub is not responding and the task is retried
    [PortOutputCommandTaskState.inProgress, PortOutputCommandTaskState.waitingForResponse],
  ]);

  constructor(public readonly message: RawPortOutputCommandMessage) {}

  public get portId(): number {
    return this.message.portId;
  }

  public get state(): PortOutputCommandTaskState {
    return this._state;
  }

  public set state(value: PortOutputCommandTaskState) {
    if (this._state === value) {
      return;
    }
    if (this.stateTransitions.get(this._state) === value) {
      this._state = value;
    } else {
      throw new Error(`Invalid state transition from ${this._state} to ${value}`);
    }
  }

  public discard(): void {
    this.result.complete();
  }

  public emitError(error: Error): void {
    this.result.error(error);
  }

  public setExecutionStatus(status: PortCommandExecutionStatus): void {
    this.result.next(status);
    this.responseReceived.next(true);
    if (this.terminalExecutionStates.has(status)) {
      this.result.complete();
    }
  }

  public dispose(): void {
    return void 0;
  }

  public accept(visitor: ITaskVisitor): void {
    visitor.visitTaskPortOutputCommand(this);
  }

  public execute(channel: IChannel): Observable<unknown> {
    if (this.message.waitForFeedback) {
      return of(null).pipe(
        switchMap(() =>
          from(channel.sendMessage(this.message, () => (this.state = PortOutputCommandTaskState.waitingForResponse)))
        ),
        switchMap(() => this.responseReceived),
        take(1)
      );
    }
    return from(channel.sendMessage(this.message)).pipe(
      tap(() => this.setExecutionStatus(PortCommandExecutionStatus.completed))
    );
  }
}
