import { ChangeEvent, ReactElement, useId } from 'react';
import { MotorUseProfile } from 'rxpoweredup';

export function MotorUseProfileSelect(
    props: {
        useProfile: MotorUseProfile | undefined;
        onUseProfileChange: (useProfile: MotorUseProfile) => void;
    }
): ReactElement {
    const useProfileId = useId();

    const useProfileOptions: Array<{ name: string; value: MotorUseProfile }> = [
        { name: 'Don\'t use profiles', value: MotorUseProfile.dontUseProfiles },
        { name: 'Use acceleration profile', value: MotorUseProfile.useAccelerationProfile },
        { name: 'Use deceleration profile', value: MotorUseProfile.useDecelerationProfile },
        { name: 'Use acceleration and deceleration profiles', value: MotorUseProfile.useAccelerationAndDecelerationProfiles },
    ];

    const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        props.onUseProfileChange(parseInt(event.target.value) as MotorUseProfile);
    };

    return (
        <>
            <label htmlFor={useProfileId}>Use profile</label>
            <select id={useProfileId}
                    value={props.useProfile}
                    onChange={handleChange}
            >
                {useProfileOptions.map((option) => (
                    <option key={option.value}
                            value={option.value}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        </>
    );
}
