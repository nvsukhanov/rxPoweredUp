import { ChangeEvent, ReactElement, useId } from 'react';
import { MotorServoEndState } from 'rxpoweredup';

export function MotorEndStateSelect(
    props: {
        endState: MotorServoEndState | undefined;
        onEndStateChange: (endState: MotorServoEndState) => void;
    }
): ReactElement {
    const motorEndStateId = useId();

    const endStateOptions: Array<{ name: string; endState: MotorServoEndState }> = [
        { name: 'Float', endState: MotorServoEndState.float },
        { name: 'Brake', endState: MotorServoEndState.brake },
        { name: 'Hold', endState: MotorServoEndState.hold },
    ];

    const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        props.onEndStateChange(parseInt(event.target.value) as MotorServoEndState);
    };

    return (
        <>
            <label htmlFor={motorEndStateId}>End state</label>
            <select id={motorEndStateId}
                    value={props.endState}
                    onChange={handleChange}
            >
                {endStateOptions.map((option) => (
                    <option key={option.endState}
                            value={option.endState}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        </>
    );
}
