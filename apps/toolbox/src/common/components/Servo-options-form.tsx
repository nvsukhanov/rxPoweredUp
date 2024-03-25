import { ReactElement, useState } from 'react';
import { MOTOR_LIMITS, MotorServoEndState, MotorUseProfile, PortOperationStartupInformation } from 'rxpoweredup';

import { SpeedInput } from './Speed-input.tsx';
import { PowerInput } from './Power-input.tsx';
import { MotorUseProfileSelect } from './Motor-use-profile-select.tsx';
import { MotorEndStateSelect } from './Motor-end-state-select.tsx';
import { NoFeedbackInput } from './No-feedback-input.tsx';
import { MotorBufferModeSelect } from './Motor-buffer-mode-select.tsx';

export type ServoOptionsFormResult = {
    speed: number;
    power: number;
    useProfile: MotorUseProfile;
    endState: MotorServoEndState;
    noFeedback: boolean;
    bufferMode: PortOperationStartupInformation;
};

export function ServoOptionsForm(
    props: {
        initialState?: ServoOptionsFormResult;
        onChanges: (result?: ServoOptionsFormResult) => void;
    }
): ReactElement {
    const [ formResult, setFormResult ] = useState<Partial<ServoOptionsFormResult>>(props.initialState ?? {
        speed: MOTOR_LIMITS.maxSpeed,
        power: MOTOR_LIMITS.maxPower,
        useProfile: MotorUseProfile.dontUseProfiles,
        endState: MotorServoEndState.hold,
        noFeedback: false,
        bufferMode: PortOperationStartupInformation.bufferIfNecessary
    });

    function isValid(
        result: Partial<ServoOptionsFormResult>
    ): result is ServoOptionsFormResult {
        return (result.speed !== undefined && result.speed >= MOTOR_LIMITS.minSpeed && result.speed <= MOTOR_LIMITS.maxSpeed)
            && (result.power !== undefined && result.power >= MOTOR_LIMITS.minPower && result.power <= MOTOR_LIMITS.maxPower)
            && (result.useProfile !== undefined)
            && (result.endState !== undefined)
            && (result.noFeedback !== undefined)
            && (result.bufferMode !== undefined);
    }

    function handleChange<K extends keyof ServoOptionsFormResult, V extends ServoOptionsFormResult[K]>(
        k: K,
        v: V | undefined
    ): void {
        const nextResult: Partial<ServoOptionsFormResult> = {
            ...formResult,
            [k]: v
        };
        setFormResult(nextResult);
        props.onChanges(isValid(nextResult) ? nextResult : undefined);
    }

    return (
        <>
            <div>
                <SpeedInput speed={formResult.speed} onSpeedChange={(v): void => handleChange('speed', v)}/>
            </div>
            <div>
                <PowerInput power={formResult.power} onPowerChange={(v): void => handleChange('power', v)}/>
            </div>
            <div>
                <MotorUseProfileSelect useProfile={formResult.useProfile} onUseProfileChange={(v): void => handleChange('useProfile', v)}/>
            </div>
            <div>
                <MotorEndStateSelect endState={formResult.endState} onEndStateChange={(v): void => handleChange('endState', v)}/>
            </div>
            <div>
                <NoFeedbackInput noFeedback={formResult.noFeedback} onNoFeedbackChange={(v): void => handleChange('noFeedback', v)}/>
            </div>
            <div>
                <MotorBufferModeSelect bufferMode={formResult.bufferMode} onBufferModeChange={(v): void => handleChange('bufferMode', v)}/>
            </div>
        </>
    );
}
