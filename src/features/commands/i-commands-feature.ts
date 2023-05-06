import { MotorProfile, MotorServoEndState, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';

export interface ICommandsFeature {
    setAccelerationTime(
        portId: number,
        time: number,
        profileId?: number
    ): Promise<void>;

    setDecelerationTime(
        portId: number,
        time: number,
        profileId?: number
    ): Promise<void>;

    setSpeed(
        portId: number,
        speed: number,
        power?: number,
        profile?: MotorProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): Promise<void>;

    goToAbsoluteDegree(
        portId: number,
        absoluteDegree: number,
        speed?: number,
        power?: number,
        endState?: MotorServoEndState,
        profile?: MotorProfile,
        startupMode?: PortOperationStartupInformation,
        completionMode?: PortOperationCompletionInformation,
    ): Promise<void>;

    setAbsoluteZeroRelativeToCurrentPosition(
        portId: number,
        absolutePosition: number,
    ): Promise<void>;
}
