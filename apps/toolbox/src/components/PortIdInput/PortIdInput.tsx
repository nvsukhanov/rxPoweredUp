import { ChangeEvent, ReactElement, useId, useState } from 'react';

export function PortIdInput(
    props: {
        portId: number | undefined;
        onPortIdChange: (portId: number | undefined) => void;
    }
): ReactElement {
    const portIdId = useId();
    const [ portId, setPortId ] = useState<string>(props.portId?.toString() ?? '');

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(event.target.value);
        if (isNaN(value)) {
            setPortId('');
            props.onPortIdChange(undefined);
        } else {
            setPortId(value.toString());
            props.onPortIdChange(value);
        }
    };

    return (
        <>
            <label htmlFor={portIdId}>Port ID</label>
            <input type="number"
                   id={portIdId}
                   value={portId}
                   onChange={handleChange}
            />
        </>
    );
}
