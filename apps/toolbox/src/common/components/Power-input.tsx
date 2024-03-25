import { ChangeEvent, ReactElement, useId, useState } from 'react';
import { MOTOR_LIMITS } from 'rxpoweredup';

export function PowerInput(
    props: {
        power: number | undefined;
        onPowerChange: (power: number | undefined) => void;
    }
): ReactElement {
    const powerId = useId();
    const [ power, setPower ] = useState<string>(props.power?.toString() ?? '');

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(event.target.value);
        if (isNaN(value)) {
            setPower('');
            props.onPowerChange(undefined);
        } else {
            setPower(value.toString());
            props.onPowerChange(value);
        }
    };

    return (
        <>
            <label htmlFor={powerId}>Power</label>
            <input type="number"
                   id={powerId}
                   value={power}
                   onChange={handleChange}
                   min={MOTOR_LIMITS.minPower}
                   max={MOTOR_LIMITS.maxPower}
            />
        </>
    );
}
