import { Observable } from 'rxjs';

import { MotorServoEndState, MotorUseProfile } from '../constants';

export enum PortCommandExecutionStatus {
    InProgress,
    Discarded,
    Completed,
    ExecutionError,
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
    // Sets the acceleration time for the motor (milliseconds).
    setAccelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus>;

    // Sets the deceleration time for the motor (milliseconds).
    setDecelerationTime(
        portId: number,
        time: number,
    ): Observable<PortCommandExecutionStatus>;

    // Starts motor rotation at the specified speed.
    // The speed is a percentage of the maximum speed (0-100).
    // Positive values rotate the motor clockwise, negative values rotate the motor counter-clockwise.
    setSpeed(
        portId: number,
        speed: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus>;

    // Rotates the motor to the specified absolute degree (relative to absolute zero).
    // Target angle must be in range from -2147483647 to 2147483647.
    // Positive values rotate the motor clockwise, negative values rotate the motor counter-clockwise.
    goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        options?: GoToAbsoluteDegreeOptions
    ): Observable<PortCommandExecutionStatus>;

    // Sets the absolute zero position for the motor relative to current position.
    // Absolute zero is the position where the absolute motor degree is 0.
    // Positive values shift the absolute zero clockwise, negative values shift the absolute zero counter-clockwise.
    setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus>;
}
