import { ChangeEvent, ReactElement, useId } from 'react';
import { PortOperationStartupInformation } from 'rxpoweredup';

export function MotorBufferModeSelect(
    props: {
        bufferMode: PortOperationStartupInformation | undefined;
        onBufferModeChange: (bufferMode: PortOperationStartupInformation) => void;
    }
): ReactElement {
    const id = useId();

    const modes: Array<{ name: string; mode: PortOperationStartupInformation }> = [
        { name: 'Buffer is necessary', mode: PortOperationStartupInformation.bufferIfNecessary },
        { name: 'Execute immediately', mode: PortOperationStartupInformation.executeImmediately },
    ];

    const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const mode = parseInt(event.target.value) as PortOperationStartupInformation;
        props.onBufferModeChange(mode);
    };

    return (
        <>
            <label htmlFor={id}>Buffer mode</label>
            <select id={id}
                    value={props.bufferMode}
                    onChange={handleChange}
            >
                {modes.map((option) => (
                    <option key={option.mode}
                            value={option.mode}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        </>
    );
}
