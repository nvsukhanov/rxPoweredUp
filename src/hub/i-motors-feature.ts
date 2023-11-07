import { Observable } from 'rxjs';

import { MotorServoEndState, MotorUseProfile, PortOperationStartupInformation } from '../constants';

/**
 * Status of the port command execution.
 * @param inProgress - command is sent to the hub and is executing
 * @param discarded - command was discarded by the hub (e.g. another port output command was sent to the motor)
 * @param completed - command was completed successfully
 * @param executionError - an error occurred during command execution
 */
export enum PortCommandExecutionStatus {
    inProgress,
    discarded,
    completed,
    executionError,
}

/**
 * Options for the setSpeed method.
 * @param power - power of the motor, range: [0, 100]
 * @param useProfile - use profile for the motor, default is 'dontUseProfiles'
 * @param noFeedback - do not wait for feedback from the motor, default is false
 * @param bufferMode - startup information for the motor, default is 'bufferIfNecessary'
 */
export type SetSpeedOptions = {
    power?: number;
    useProfile?: MotorUseProfile;
    noFeedback?: boolean;
    bufferMode?: PortOperationStartupInformation;
}

/**
 * Options for the goToPosition method.
 * @param speed - speed of the motor, range: [-100, - 100]
 * @param power - power of the motor, range: [0, 100]
 * @param endState - end state of the motor, default is 'hold'
 * @param useProfile - use profile for the motor, default is 'dontUseProfiles'
 * @param noFeedback - do not wait for feedback from the motor, default is false.
 * @param bufferMode - startup information for the motor, default is 'bufferIfNecessary'
 *
 * WARNING: setting noFeedback to true can lead to the motor rotating forever (until the hub is switched off) if the next command is issued in quick succession.
 */
export type GoToPositionOptions = {
    speed?: number;
    power?: number;
    endState?: MotorServoEndState;
    useProfile?: MotorUseProfile;
    noFeedback?: boolean;
    bufferMode?: PortOperationStartupInformation;
}

/**
 * Options for the rotateByDegree method.
 * @param speed - speed of the motor, range: [-100, - 100]
 * @param power - power of the motor, range: [0, 100]
 * @param endState - end state of the motor, default is 'hold'
 * @param useProfile - use profile for the motor, default is 'dontUseProfiles'
 * @param noFeedback - do not wait for feedback from the motor, default is false
 * @param bufferMode - startup information for the motor, default is 'executeImmediately' * @param endState - end state of the motor, default is 'hold'
 *
 * WARNING: setting noFeedback to true can lead to the motor rotating forever (until the hub is switched off) if the next command is issued in quick succession.
 */
export type RotateByDegreeOptions = {
    speed?: number;
    power?: number;
    endState?: MotorServoEndState;
    useProfile?: MotorUseProfile;
    noFeedback?: boolean;
    bufferMode?: PortOperationStartupInformation;
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
     * WARNING: setting noFeedback to true can lead to the motor rotating forever (until the hub is switched off) if
     * the next command issued in quick succession. Use with caution.
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
     *
     * WARNING: setting noFeedback to true can lead to the motor rotating forever (until the hub is switched off) if
     * the next command is issued in quick succession. Use with caution.
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
     * The sign of the speed is ignored
     *
     * WARNING: setting noFeedback to true can lead to the motor rotating forever (until the hub is switched off) if
     * the next command is issued in quick succession. Use with caution.
     * @param portId - The port to issue command at
     * @param degree - Step in degrees
     * @param options - See RotateByDegreeOptions
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
     * @param portId - The port to set zero position at.
     * @param position - Target position in degrees.
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
     * @param portId - The port to read value from.
     * @param modeId - The mode to read from. Optional, defaults to the well-known motor position mode id
     */
    getPosition(portId: number, modeId?: number): Observable<number>;

    /**
     * Return current position of the motor relative to absolute zero position.
     * Absolute zero position is the position that is hard-coded in the motor at the factory.
     *
     * @param portId - The port to read value from.
     * @param modeId - The mode to read from. Optional, defaults to the well-known absolute position mode id
     */
    getAbsolutePosition(portId: number, modeId?: number): Observable<number>;

    /**
     * Resets the encoder of the motor, setting the zero position (see getPosition) to absolute zero position (see getAbsolutePosition).
     *
     * @param portId - The port to reset encoder at.
     * @param absolutePositionModeId - The mode to read from. Optional, defaults to the well-known absolute position mode id
     */
    resetEncoder(portId: number, absolutePositionModeId?: number): Observable<PortCommandExecutionStatus>;
}
