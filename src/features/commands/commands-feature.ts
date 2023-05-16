import { Observable } from 'rxjs';

import { MOTOR_ACC_DEC_DEFAULT_PROFILE_ID, MOTOR_LIMITS, MessageType, MotorServoEndState, MotorUseProfile, } from '../../constants';
import { GoToAbsoluteDegreeOptions, IOutboundMessenger, IPortOutputCommandsFeature, PortCommandExecutionStatus, SetSpeedOptions } from '../../hub';
import { RawMessage } from '../../types';
import { IPortOutputCommandOutboundMessageFactory } from './i-port-output-command-outbound-message-factory';

export class CommandsFeature implements IPortOutputCommandsFeature {
    constructor(
        private readonly messenger: IOutboundMessenger,
        private readonly portOutputCommandOutboundMessageFactoryService: IPortOutputCommandOutboundMessageFactory,
    ) {
    }

    public setAccelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setAccelerationTime(
            portId,
            timeMs,
            MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
        );
        return this.execute(message);
    }

    public setDecelerationTime(
        portId: number,
        timeMs: number,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.setDecelerationTime(
            portId,
            timeMs,
            MOTOR_ACC_DEC_DEFAULT_PROFILE_ID
        );
        return this.execute(message);
    }

    public setSpeed(
        portId: number,
        speed: number,
        options?: SetSpeedOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.startRotation(
            portId,
            speed,
            options?.power ?? MOTOR_LIMITS.maxPower,
            options?.useProfile ?? MotorUseProfile.dontUseProfiles,
        );
        return this.execute(message);
    }

    public goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        options?: GoToAbsoluteDegreeOptions
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.goToAbsolutePosition(
            portId,
            absoluteDegree,
            options?.speed ?? MOTOR_LIMITS.maxSpeed,
            options?.power ?? MOTOR_LIMITS.maxPower,
            options?.endState ?? MotorServoEndState.hold,
            options?.useProfile ?? MotorUseProfile.dontUseProfiles,
        );
        return this.execute(message);
    }

    public setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Observable<PortCommandExecutionStatus> {
        const message = this.portOutputCommandOutboundMessageFactoryService.presetEncoder(
            portId,
            // We use negative value here because:
            // 1. presetting encoder sets absolute zero relative to current absolute motor position
            //      e.g. if current position is 100 and absolutePosition is 50, then absolute zero will be set to 150
            // 2. somehow hub treats absolute zero in an unusual way - while positive motor angle increase treated as clockwise rotation,
            //      incrementing absolute zero by positive value shifts absolute zero in counter-clockwise direction
            // so we invert value here to have an expected behavior of API.
            // Also, we invert value here (and not in presetEncoder method) in order to keep message factories as close
            // to original documentation as possible.
            -absolutePosition,
        );

        return this.execute(message);
    }

    private execute(
        message: RawMessage<MessageType.portOutputCommand>,
    ): Observable<PortCommandExecutionStatus> {
        return this.messenger.sendPortOutputCommand(message);
    }
}
