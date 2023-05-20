import { Observable } from 'rxjs';

import { MotorServoEndState, MotorUseProfile } from '../constants';

export enum PortCommandExecutionStatus {
    inProgress,
    discarded,
    completed,
    executionError,
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
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
     * @param portId
     * @param timeMs - acceleration time in milliseconds
     */
    setAccelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Sets the deceleration time for the motor.
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
     * @param portId
     * @param timeMs - deceleration time in milliseconds
     */
    setDecelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Starts motor rotation at the specified speed.
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
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
     * Stream emits inProgress status when the motor starts rotating.
     * Stream completes when one of the following happens:
     * 1. The motor has reached the specified degree.
     * 2. The motor was unable to reach the specified degree (e.g. blocked).
     * 3. The command was discarded by the hub (e.g. another port output command was sent to the motor).
     *
     * NB: Positive values are calculated clockwise, negative values are calculated counter-clockwise.
     *
     * WARNING! Two sequential calls to this method may result in an infinite motor rotation until the next command is sent to the motor
     * after some time (or after motor has rotated for a while?).
     * This could happen if two commands has been sent in quick succession. Consider the following example:
     * nextHub.ports.onIoAttach(0).pipe(
     *    switchMap(() => nextHub.ports.goToAbsoluteDegree(0, -180).pipe(take(1))), // (1) - notice that we don't wait for the command to complete
     *    switchMap(() => nextHub.ports.goToAbsoluteDegree(0, 0)), // (2)
     * )
     * The communication would look like this:
     * send: (1) - "motor at port 0, go to -180 degrees"
     * // wait until InProgress status for task (1) is received
     * receive: (1) - InProgress // motor starts rotating
     * send: (2) - "motor at port 0, go to 0 degrees"
     * // wait until InProgress status for task (2) is received
     * receive: (1) - Discarded, (2) - InProgress
     * we would expect that a motor will start rotating counter-clockwise for a moment, then stop and rotate clockwise to 0 degrees
     * (or at least do nothing), but in reality it will rotate counter-clockwise infinitely until the next command is sent to the motor.
     * TODO: need workaround for this issue
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
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
     *
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
