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
    /**
     * Sets the acceleration time for the motor.
     * @param portId
     * @param timeMs - acceleration time in milliseconds
     */
    setAccelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Sets the deceleration time for the motor.
     * @param portId
     * @param timeMs - deceleration time in milliseconds
     */
    setDecelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Starts motor rotation at the specified speed.
     * @param portId
     * @param speed - speed in range (-100 - 100), where positive values rotate the motor clockwise, negative values rotate the motor counter-clockwise.
     * @param options
     */
    setSpeed(
        portId: number,
        speed: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Rotates the motor to the specified absolute degree (relative to absolute zero).
     * Positive values are calculated clockwise, negative values are calculated counter-clockwise.
     * @param portId
     * @param absoluteDegree - must be in range from -2147483647 to 2147483647
     * @param options
     */
    goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        options?: GoToAbsoluteDegreeOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Sets the absolute zero position for the motor relative to current position.
     * Absolute zero is the position where the absolute motor degree is 0.
     * Positive values shift the absolute zero clockwise, negative values shift the absolute zero counter-clockwise.
     * @param portId
     * @param absolutePosition
     */
    setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus>;
}
