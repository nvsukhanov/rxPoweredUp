import { InjectionToken } from 'tsyringe';

import { MotorServoEndState, MotorUseProfile, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';
import { RawPortOutputCommandMessage } from '../../types';

export interface IMotorCommandsOutboundMessageFactory {
    startPower(
        portId: number,
        power: number,
        powerModeId: number,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    startSpeed(
        portId: number,
        speed: number,
        power?: number,
        useProfile?: MotorUseProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    startRotationSynchronized(
        virtualPortId: number,
        speed1: number,
        speed2: number,
        power?: number,
        useProfile?: MotorUseProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    goToAbsolutePosition(
        portId: number,
        absolutePosition: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        useProfile?: MotorUseProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    goToAbsolutePositionSynchronized(
        virtualPortId: number,
        absolutePosition1: number,
        absolutePosition2: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        useProfile?: MotorUseProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    startSpeedForDegrees(
        portId: number,
        degree: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        useProfile?: MotorUseProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage

    presetEncoder(
        portId: number,
        absolutePosition: number,
        positionModeId: number,
    ): RawPortOutputCommandMessage;

    setAccelerationTime(
        portId: number,
        timeMs: number,
        profileId?: number,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;

    setDecelerationTime(
        portId: number,
        timeMs: number,
        profileId?: number,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawPortOutputCommandMessage;
}

export const PORT_OUTPUT_COMMAND_MESSAGE_FACTORY: InjectionToken<IMotorCommandsOutboundMessageFactory> = Symbol('IPortOutputCommandOutboundMessageFactory');
