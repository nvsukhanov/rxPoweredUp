import { InjectionToken } from 'tsyringe';

import { MessageType, MotorProfile, MotorServoEndState, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';
import { RawMessage } from '../../types';

export interface IPortOutputCommandOutboundMessageFactory {
    startRotation(
        portId: number,
        speed: number,
        power?: number,
        profile?: MotorProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawMessage<MessageType.portOutputCommand>;

    goToAbsolutePosition(
        portId: number,
        absolutePosition: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        profile?: MotorProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawMessage<MessageType.portOutputCommand>;

    presetEncoder(
        portId: number,
        absolutePosition: number,
    ): RawMessage<MessageType.portOutputCommand>;

    setAccelerationTime(
        portId: number,
        timeMs: number,
        profileId?: number,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawMessage<MessageType.portOutputCommand>;

    setDecelerationTime(
        portId: number,
        timeMs: number,
        profileId?: number,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): RawMessage<MessageType.portOutputCommand>;
}

export const PORT_OUTPUT_COMMAND_MESSAGE_FACTORY: InjectionToken<IPortOutputCommandOutboundMessageFactory> = Symbol('IPortOutputCommandOutboundMessageFactory');
