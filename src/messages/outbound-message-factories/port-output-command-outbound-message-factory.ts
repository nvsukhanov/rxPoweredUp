import { injectable } from 'tsyringe';

import { RawPortOutputCommandMessage } from '../../types';
import {
    MOTOR_ACC_DEC_DEFAULT_PROFILE_ID,
    MOTOR_LIMITS,
    MessageType,
    MotorServoEndState,
    MotorUseProfile,
    OutputSubCommand,
    PortOperationCompletionInformation,
    PortOperationStartupInformation,
    WriteDirectModeDataSubCommand
} from '../../constants';
import { numberToUint32LEArray } from '../../helpers';
import { IMotorCommandsOutboundMessageFactory } from '../../features';

@injectable()
export class PortOutputCommandOutboundMessageFactory implements IMotorCommandsOutboundMessageFactory {
    public startRotation(
        portId: number,
        speed: number,
        power: number = MOTOR_LIMITS.maxPower,
        profile: MotorUseProfile = MotorUseProfile.dontUseProfiles,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.executeImmediately,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureSpeedIsWithinLimits(speed);
        this.ensurePowerIsWithinLimits(power);

        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId,
            payload: new Uint8Array([
                portId,
                startupMode | completionMode,
                OutputSubCommand.startSpeed,
                speed,
                power,
                profile
            ])
        };
    }

    public startRotationSynchronized(
        virtualPortId: number,
        speed1: number,
        speed2: number,
        power: number = MOTOR_LIMITS.maxPower,
        useProfile: MotorUseProfile = MotorUseProfile.dontUseProfiles,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.executeImmediately,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureSpeedIsWithinLimits(speed1);
        this.ensureSpeedIsWithinLimits(speed2);
        this.ensurePowerIsWithinLimits(power);

        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId: virtualPortId,
            payload: new Uint8Array([
                virtualPortId,
                startupMode | completionMode,
                OutputSubCommand.startSpeedSynchronized,
                speed1,
                speed2,
                power,
                useProfile
            ])
        };
    }

    public goToAbsolutePosition(
        portId: number,
        absolutePosition: number,
        speed: number = MOTOR_LIMITS.maxSpeed,
        power: number = MOTOR_LIMITS.maxPower,
        endState: MotorServoEndState = MotorServoEndState.hold,
        profile: MotorUseProfile = MotorUseProfile.dontUseProfiles,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.executeImmediately,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureSpeedIsWithinLimits(speed);
        this.ensurePowerIsWithinLimits(power);
        this.ensureAbsolutePositionIsWithinLimits(absolutePosition);

        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId,
            payload: new Uint8Array([
                portId,
                startupMode | completionMode,
                OutputSubCommand.gotoAbsolutePosition,
                ...numberToUint32LEArray(absolutePosition),
                speed,
                power,
                endState,
                profile
            ])
        };
    }

    public goToAbsolutePositionSynchronized(
        virtualPortId: number,
        absolutePosition1: number,
        absolutePosition2: number,
        speed: number = MOTOR_LIMITS.maxSpeed,
        power: number = MOTOR_LIMITS.maxPower,
        endState: MotorServoEndState = MotorServoEndState.hold,
        useProfile: MotorUseProfile = MotorUseProfile.dontUseProfiles,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.executeImmediately,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureAbsolutePositionIsWithinLimits(absolutePosition1);
        this.ensureAbsolutePositionIsWithinLimits(absolutePosition2);
        this.ensureSpeedIsWithinLimits(speed);
        this.ensurePowerIsWithinLimits(power);

        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId: virtualPortId,
            payload: new Uint8Array([
                virtualPortId,
                startupMode | completionMode,
                OutputSubCommand.gotoAbsolutePositionSynchronized,
                ...numberToUint32LEArray(absolutePosition1),
                ...numberToUint32LEArray(absolutePosition2),
                speed,
                power,
                endState,
                useProfile
            ])
        };
    }

    public presetEncoder(
        portId: number,
        absolutePosition: number,
    ): RawPortOutputCommandMessage {
        this.ensureAbsolutePositionIsWithinLimits(absolutePosition);

        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId,
            payload: new Uint8Array([
                portId,
                PortOperationStartupInformation.bufferIfNecessary | PortOperationCompletionInformation.commandFeedback,
                OutputSubCommand.writeDirectModeData,
                WriteDirectModeDataSubCommand.presetEncoder,
                ...numberToUint32LEArray(absolutePosition),
            ])
        };
    }

    public setAccelerationTime(
        portId: number,
        timeMs: number,
        profileId: number = MOTOR_ACC_DEC_DEFAULT_PROFILE_ID,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.bufferIfNecessary,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureAccDecTimeIsWithinLimits(timeMs);
        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId,
            payload: new Uint8Array([
                portId,
                startupMode | completionMode,
                OutputSubCommand.setAccTime,
                timeMs,
                profileId
            ])
        };
    }

    public setDecelerationTime(
        portId: number,
        timeMs: number,
        profileId: number = MOTOR_ACC_DEC_DEFAULT_PROFILE_ID,
        startupMode: PortOperationStartupInformation = PortOperationStartupInformation.bufferIfNecessary,
        completionMode: PortOperationCompletionInformation = PortOperationCompletionInformation.commandFeedback,
    ): RawPortOutputCommandMessage {
        this.ensureAccDecTimeIsWithinLimits(timeMs);
        return {
            header: {
                messageType: MessageType.portOutputCommand,
            },
            portId,
            payload: new Uint8Array([
                portId,
                startupMode | completionMode,
                OutputSubCommand.setDecTime,
                timeMs,
                profileId
            ])
        };
    }

    private ensureAccDecTimeIsWithinLimits(timeMs: number): void {
        if (timeMs > MOTOR_LIMITS.maxAccDecTime || timeMs < MOTOR_LIMITS.minAccDecTime) {
            throw new Error(`Acceleration/deceleration time must be between ${MOTOR_LIMITS.minAccDecTime} and ${MOTOR_LIMITS.maxAccDecTime}. Got ${timeMs}`);
        }
    }

    private ensureSpeedIsWithinLimits(speed: number): void {
        if (speed > MOTOR_LIMITS.maxSpeed || speed < MOTOR_LIMITS.minSpeed) {
            throw new Error(`Speed must be between ${MOTOR_LIMITS.minSpeed} and ${MOTOR_LIMITS.maxSpeed}. Got ${speed}`);
        }
    }

    private ensurePowerIsWithinLimits(power: number): void {
        if (power > MOTOR_LIMITS.maxPower || power < MOTOR_LIMITS.minPower) {
            throw new Error(`Power must be between ${MOTOR_LIMITS.minPower} and ${MOTOR_LIMITS.maxPower}. Got ${power}`);
        }
    }

    private ensureAbsolutePositionIsWithinLimits(absolutePosition: number): void {
        if (absolutePosition > MOTOR_LIMITS.maxRawAngle || absolutePosition < MOTOR_LIMITS.minRawAngle) {
            throw new Error(`Absolute position must be between ${MOTOR_LIMITS.minRawAngle} and ${MOTOR_LIMITS.maxRawAngle}. Got ${absolutePosition}`);
        }
    }

}
