import { ChangeEvent, ReactElement, useId, useState } from 'react';
import { MOTOR_LIMITS } from 'rxpoweredup';

export function SpeedInput(
    props: {
        speed: number | undefined;
        onSpeedChange: (speed: number | undefined) => void;
    }
): ReactElement {
    const speedId = useId();
    const [ speed, setSpeed ] = useState<string>(props.speed?.toString() ?? '');

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(event.target.value);
        if (isNaN(value)) {
            setSpeed('');
            props.onSpeedChange(undefined);
        } else {
            setSpeed(value.toString());
            props.onSpeedChange(value);
        }
    };

    return (
        <>
            <label htmlFor={speedId}>Speed</label>
            <input type="number"
                   id={speedId}
                   value={speed}
                   onChange={handleChange}
                   min={MOTOR_LIMITS.minSpeed}
                   max={MOTOR_LIMITS.maxSpeed}
            />
        </>
    );
}
