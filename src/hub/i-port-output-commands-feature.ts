import { Observable } from 'rxjs';

import { MotorServoEndState, MotorUseProfile } from '../constants';

export enum PortCommandExecutionStatus {
    InProgress,
    Discarded,
    Completed,
    ExecutionError,
}

export type SetAccelerationTimeOptions = {
    profileId: number;
}

export type SetDecelerationTimeOptions = {
    profileId: number;
}

export type SetSpeedOptions = {
    power?: number;
    useProfile?: MotorUseProfile;
}

export type GoToAbsoluteDegreeOptions = {
    speed?: number;
    power?: number;
    endState?: MotorServoEndState;
    useProfile?: MotorUseProfile;
}

export interface IPortOutputCommandsFeature {
    setAccelerationTime(
        portId: number,
        time: number,
        options?: SetAccelerationTimeOptions
    ): Observable<PortCommandExecutionStatus>;

    setDecelerationTime(
        portId: number,
        time: number,
        options?: SetDecelerationTimeOptions
    ): Observable<PortCommandExecutionStatus>;

    setSpeed(
        portId: number,
        speed: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus>;

    goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        options?: GoToAbsoluteDegreeOptions
    ): Observable<PortCommandExecutionStatus>;

    setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus>;
}
