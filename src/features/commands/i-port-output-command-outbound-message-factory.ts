import { InjectionToken } from 'tsyringe';

import { MotorServoEndState, MotorUseProfile, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';
import { RawPortOutputCommandMessage } from '../../types';

export interface IPortOutputCommandOutboundMessageFactory {
    startRotation(
        portId: number,
        speed: number,
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

    presetEncoder(
        portId: number,
        absolutePosition: number,
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

export const PORT_OUTPUT_COMMAND_MESSAGE_FACTORY: InjectionToken<IPortOutputCommandOutboundMessageFactory> = Symbol('IPortOutputCommandOutboundMessageFactory');
