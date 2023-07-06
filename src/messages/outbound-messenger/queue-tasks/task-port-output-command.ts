import { BehaviorSubject, EMPTY, Observable, Subject, filter, from, of, switchMap, take, tap } from 'rxjs';

import { IQueueTask, ITaskVisitor } from '../queue';
import { PortCommandExecutionStatus } from '../../../hub';
import { RawPortOutputCommandMessage } from '../../../types';
import { IChannel } from '../i-channel';

export enum PortOutputCommandTaskState {
    pending,
    waitingForResponse,
    inProgress
}

/**
 * This class represents a task that is responsible for sending a single port output command to the hub.
 */
export class TaskPortOutputCommand implements IQueueTask<PortCommandExecutionStatus> {
    public readonly result = new Subject<PortCommandExecutionStatus>();

    private _state = PortOutputCommandTaskState.pending;

    private readonly responseReceived = new BehaviorSubject<boolean>(false);

    private terminalExecutionStates: ReadonlySet<PortCommandExecutionStatus> = new Set([
        PortCommandExecutionStatus.completed,
        PortCommandExecutionStatus.discarded,
        PortCommandExecutionStatus.executionError
    ]);

    private stateTransitions: ReadonlyMap<PortOutputCommandTaskState, PortOutputCommandTaskState> = new Map([
        [ PortOutputCommandTaskState.pending, PortOutputCommandTaskState.waitingForResponse ],
        [ PortOutputCommandTaskState.waitingForResponse, PortOutputCommandTaskState.inProgress ]
    ]);

    constructor(
        public readonly message: RawPortOutputCommandMessage
    ) {
    }

    public get portId(): number {
        return this.message.portId;
    }

    public get state(): PortOutputCommandTaskState {
        return this._state;
    }

    public set state(
        value: PortOutputCommandTaskState
    ) {
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

    public emitError(
        error: Error
    ): void {
        this.result.error(error);
    }

    public setExecutionStatus(
        status: PortCommandExecutionStatus
    ): void {
        this.result.next(status);
        this.responseReceived.next(true);
        if (this.terminalExecutionStates.has(status)) {
            this.result.complete();
        }
    }

    public dispose(): Observable<void> {
        return EMPTY;
    }

    public accept(
        visitor: ITaskVisitor
    ): void {
        visitor.visitTaskPortOutputCommand(this);
    }

    public execute(
        channel: IChannel
    ): Observable<unknown> {
        return of(null).pipe(
            switchMap(() => from(channel.sendMessage(this.message))),
            tap(() => this.state = PortOutputCommandTaskState.waitingForResponse),
            switchMap(() => this.responseReceived),
            filter((v) => !!v),
            take(1)
        );
    }
}
