import { Observable, map, switchMap } from 'rxjs';

import {
    MOTOR_ACC_DEC_DEFAULT_PROFILE_ID,
    MOTOR_LIMITS,
    MessageType,
    MotorServoEndState,
    MotorUseProfile,
    PortModeName,
    WELL_KNOWN_MOTOR_PORT_MODE_IDS,
} from '../../constants';
import { GoToPositionOptions, IMotorsFeature, IOutboundMessenger, PortCommandExecutionStatus, SetSpeedOptions } from '../../hub';
import { RawMessage } from '../../types';
import { IMotorCommandsOutboundMessageFactory } from './i-motor-commands-outbound-message-factory';
import { IPortValueProvider } from './i-port-value-provider';

export class MotorsFeature implements IMotorsFeature {
    constructor(
        private readonly messenger: IOutboundMessenger,
        private readonly portOutputCommandOutboundMessageFactoryService: IMotorCommandsOutboundMessageFactory,
        private readonly portValueProvider: IPortValueProvider
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

    public goToPosition(
        portId: number,
        absoluteDegree: number,
        options?: GoToPositionOptions
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

    public setZeroPositionRelativeToCurrentPosition(
        portId: number,
        offset: number,
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
            -offset,
        );

        return this.execute(message);
    }

    public getAbsolutePosition(
        portId: number,
        modeId: number = WELL_KNOWN_MOTOR_PORT_MODE_IDS[PortModeName.absolutePosition]
    ): Observable<number> {
        return this.portValueProvider.getPortValue(
            portId,
            modeId,
            PortModeName.absolutePosition
        ).pipe(
            map((r) => r.absolutePosition)
        );
    }

    public getPosition(
        portId: number,
        modeId: number = WELL_KNOWN_MOTOR_PORT_MODE_IDS[PortModeName.position]
    ): Observable<number> {
        return this.portValueProvider.getPortValue(
            portId,
            modeId,
            PortModeName.position
        ).pipe(
            map((r) => r.position)
        );
    }

    public resetEncoder(
        portId: number,
        absolutePositionModeId: number = WELL_KNOWN_MOTOR_PORT_MODE_IDS[PortModeName.absolutePosition]
    ): Observable<PortCommandExecutionStatus> {
        return this.portValueProvider.getPortValue(
            portId,
            absolutePositionModeId,
            PortModeName.absolutePosition
        ).pipe(
            switchMap((offset) => this.setZeroPositionRelativeToCurrentPosition(portId, -offset.absolutePosition))
        );
    }

    private execute(
        message: RawMessage<MessageType.portOutputCommand>,
    ): Observable<PortCommandExecutionStatus> {
        return this.messenger.sendPortOutputCommand(message);
    }
}
