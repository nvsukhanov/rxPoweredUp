import { Observable } from 'rxjs';

import { MotorProfile, MotorServoEndState } from '../constants';

export enum PortCommandExecutionStatus {
    InProgress,
    Discarded,
    Completed,
    ExecutionError,
}

export interface ICommandsFeature {
    setAccelerationTime(
        portId: number,
        time: number,
        profileId?: number
    ): Observable<PortCommandExecutionStatus>;

    setDecelerationTime(
        portId: number,
        time: number,
        profileId?: number
    ): Observable<PortCommandExecutionStatus>;

    setSpeed(
        portId: number,
        speed: number,
        power?: number,
        profile?: MotorProfile,
    ): Observable<PortCommandExecutionStatus>;

    goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        profile?: MotorProfile,
    ): Observable<PortCommandExecutionStatus>;

    setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus>;
}
