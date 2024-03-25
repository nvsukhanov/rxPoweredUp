import { ReactElement, useState } from 'react';
import { MOTOR_LIMITS, MotorUseProfile, PortOperationStartupInformation } from 'rxpoweredup';

import { PowerInput } from './Power-input.tsx';
import { MotorUseProfileSelect } from './Motor-use-profile-select.tsx';
import { NoFeedbackInput } from './No-feedback-input.tsx';
import { MotorBufferModeSelect } from './Motor-buffer-mode-select.tsx';

export type SpeedOptionsFormResult = {
    power: number;
    useProfile: MotorUseProfile;
    noFeedback: boolean;
    bufferMode: PortOperationStartupInformation;
};

export function SpeedOptionsForm(
    props: {
        initialState?: SpeedOptionsFormResult;
        onChanges: (result?: SpeedOptionsFormResult) => void;
    }
): ReactElement {
    const [ formResult, setFormResult ] = useState<Partial<SpeedOptionsFormResult>>(props.initialState ?? {
        power: MOTOR_LIMITS.maxPower,
        useProfile: MotorUseProfile.dontUseProfiles,
        noFeedback: false,
        bufferMode: PortOperationStartupInformation.bufferIfNecessary
    });

    function isValid(
        result: Partial<SpeedOptionsFormResult>
    ): result is SpeedOptionsFormResult {
        return (result.power !== undefined && result.power >= MOTOR_LIMITS.minPower && result.power <= MOTOR_LIMITS.maxPower)
            && (result.useProfile !== undefined)
            && (result.noFeedback !== undefined)
            && (result.bufferMode !== undefined);
    }

    function handleChange<K extends keyof SpeedOptionsFormResult, V extends SpeedOptionsFormResult[K]>(
        k: K,
        v: V | undefined
    ): void {
        const nextResult: Partial<SpeedOptionsFormResult> = {
            ...formResult,
            [k]: v
        };
        setFormResult(nextResult);
        props.onChanges(isValid(nextResult) ? nextResult : undefined);
    }

    return (
        <>
            <div>
                <PowerInput power={formResult.power} onPowerChange={(v): void => handleChange('power', v)}/>
            </div>
            <div>
                <MotorUseProfileSelect useProfile={formResult.useProfile} onUseProfileChange={(v): void => handleChange('useProfile', v)}/>
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
