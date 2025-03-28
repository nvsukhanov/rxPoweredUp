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
 * Options for the startSpeed method.
 * @param power - power of the motor, range: [0, 100]
 * @param useProfile - use profile for the motor, default is 'dontUseProfiles'
 * @param noFeedback - do not wait for feedback from the motor, default is false
 * @param bufferMode - startup information for the motor, default is 'bufferIfNecessary'
 */
export type StartSpeedOptions = {
  power?: number;
  useProfile?: MotorUseProfile;
  noFeedback?: boolean;
  bufferMode?: PortOperationStartupInformation;
};

/**
 * Options for the startPower method (uses direct write). It seems like it works for PortModeName.speed also.
 * @param powerModeId - power mode ID, defaults to WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.power]
 * @param noFeedback - do not wait for feedback from the motor, default is false
 * @param bufferMode - startup information for the motor, default is 'bufferIfNecessary'
 */
export type StartPowerOptions = {
  powerModeId?: number;
  noFeedback?: boolean;
  bufferMode?: PortOperationStartupInformation;
};

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
export type ServoCommandOptions = {
  speed?: number;
  power?: number;
  endState?: MotorServoEndState;
  useProfile?: MotorUseProfile;
  noFeedback?: boolean;
  bufferMode?: PortOperationStartupInformation;
};

export interface IMotorsFeature {
  /**
   * Sets the acceleration time for the motor.
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   * @param portId
   * @param timeMs - acceleration time in milliseconds
   */
  setAccelerationTime(portId: number, timeMs: number): Observable<PortCommandExecutionStatus>;

  /**
   * Sets the deceleration time for the motor.
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   * @param portId
   * @param timeMs - deceleration time in milliseconds
   */
  setDecelerationTime(portId: number, timeMs: number): Observable<PortCommandExecutionStatus>;

  /**
   * Starts motor power at the specified power.
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   *
   * @param portId
   * @param power - power in range (0 - 100)
   * @param powerModeId - power mode ID, defaults to WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.power]
   * @param options
   */
  startPower(portId: number, power: number, powerModeId: number, options?: StartPowerOptions): Observable<PortCommandExecutionStatus>;

  /**
   * Starts motor rotation at the specified speed.
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   *
   * @param portId
   * @param speed - speed in range (-100 - 100), where positive values rotate the motor clockwise, negative values rotate the motor counter-clockwise.
   * @param options
   */
  startSpeed(portId: number, speed: number, options?: StartSpeedOptions): Observable<PortCommandExecutionStatus>;

  /**
   * Starts motors rotation at the specified speed in synchronized mode (applicable only for virtual ports).
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   *
   * @param virtualPortId
   * @param speed1
   * @param speed2
   * @param options
   */
  setSpeedSynchronized(virtualPortId: number, speed1: number, speed2: number, options?: StartSpeedOptions): Observable<PortCommandExecutionStatus>;

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
  goToPosition(portId: number, targetDegree: number, options?: ServoCommandOptions): Observable<PortCommandExecutionStatus>;

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
    options?: ServoCommandOptions
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
  rotateByDegree(portId: number, degree: number, options?: ServoCommandOptions): Observable<PortCommandExecutionStatus>;

  /**
   * Shifts motor's encoder zero position relative to current position.
   * Stream completes when the command is executed by the hub. Do not expect InProgress status to be emitted.
   *
   * Positive values shift the absolute zero clockwise, negative values shift the absolute zero counter-clockwise.
   * @param portId - The port to set zero position at.
   * @param position - Target position in degrees.
   * @param positionModeId - Position mode ID, defaults to WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.position]
   */
  setZeroPositionRelativeToCurrentPosition(portId: number, position: number, positionModeId?: number): Observable<PortCommandExecutionStatus>;
}
