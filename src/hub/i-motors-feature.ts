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
    noFeedback?: boolean;
}

export type GoToPositionOptions = {
    speed?: number;
    power?: number;
    endState?: MotorServoEndState;
    useProfile?: MotorUseProfile;
    noFeedback?: boolean;
}

/**
 * Options for the rotateByDegree method.
 * @param speed - speed of the motor, 0 - 100
 * @param power - power of the motor, 0 - 100
 * @param endState - end state of the motor, default is 'hold'
 * @param useProfile - use profile for the motor, default is 'dontUseProfiles'
 * @param noFeedback - if true, the stream will complete immediately after the command is received by the hub.
 */
export type RotateByDegreeOptions = {
    speed?: number;
    power?: number;
    endState?: MotorServoEndState;
    useProfile?: MotorUseProfile;
    noFeedback?: boolean;
}

export interface IMotorsFeature {
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
     * If 'noFeedback' option is set to true, the stream will complete immediately after the command is received by the hub.
     *
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
     * Starts motors rotation at the specified speed in synchronized mode (applicable only for virtual ports).
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
     * If 'noFeedback' option is set to true, the stream will complete immediately after the command is received by the hub.
     *
     * @param virtualPortId
     * @param speed1
     * @param speed2
     * @param options
     */
    setSpeedSynchronized(
        virtualPortId: number,
        speed1: number,
        speed2: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Rotates the motor to the specified position (relative to zero).
     * Zero is the position when the motor was last switched on or connected to the hub.
     * Positive values are calculated clockwise, negative values are calculated counter-clockwise.
     *
     * Stream emits inProgress status when the motor starts rotating.
     * Stream completes when one of the following happens:
     * 1. The motor has reached the specified degree.
     * 2. The motor was unable to reach the specified degree (e.g. blocked).
     * 3. The command was discarded by the hub (e.g. another port output command was sent to the motor).
     * If 'noFeedback' option is set to true, the stream will complete immediately after the command is received by the hub.
     * @param portId
     * @param targetDegree - must be in range from -2147483647 to 2147483647
     * @param options
     */
    goToPosition(
        portId: number,
        targetDegree: number,
        options?: GoToPositionOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Rotates virtual port motors to the specified positions (relative to zero).
     * @see goToPosition
     *
     * @param virtualPortId
     * @param targetDegree1
     * @param targetDegree2
     * @param options
     */
    goToPositionSynchronized(
        virtualPortId: number,
        targetDegree1: number,
        targetDegree2: number,
        options?: GoToPositionOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Rotates the motor by the specified degree (positive values rotate clockwise, negative values rotate counter-clockwise).
     * @param portId
     * @param degree
     * @param options - see RotateByDegreeOptions
     */
    rotateByDegree(
        portId: number,
        degree: number,
        options?: RotateByDegreeOptions
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Shifts motor's encoder zero position relative to current position.
     * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
     *
     * Positive values shift the absolute zero clockwise, negative values shift the absolute zero counter-clockwise.
     * @param portId
     * @param position
     */
    setZeroPositionRelativeToCurrentPosition(
        portId: number,
        position: number,
    ): Observable<PortCommandExecutionStatus>;

    /**
     * Return current position of the motor relative to zero position.
     * Zero position is the position where the motor has been switched on or connected to the hub,
     * if the encoder has not been reset (see resetEncoder) or
     *
     * @param portId
     * @param modeId - optional, if not specified, the well-known mode for the servo-motor will be used (unreliable, may depend on the motor type)
     */
    getPosition(portId: number, modeId?: number): Observable<number>;

    /**
     * Return current position of the motor relative to absolute zero position.
     * Absolute zero position is the position that is hard-coded in the motor at the factory.
     *
     * @param portId
     * @param modeId - optional, if not specified, the well-known mode for the servo-motor will be used (unreliable, may depend on the motor type)
     */
    getAbsolutePosition(portId: number, modeId?: number): Observable<number>;

    /**
     * Resets the encoder of the motor, setting the zero position (see getPosition) to absolute zero position (see getAbsolutePosition).
     *
     * @param portId
     * @param absolutePositionModeId - optional, if not specified, the well-known mode for the servo-motor will be used (unreliable,
     *                                 may depend on the motor type)
     */
    resetEncoder(portId: number, absolutePositionModeId?: number): Observable<PortCommandExecutionStatus>;
}
