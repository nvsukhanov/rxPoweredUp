import { ChangeEvent, ReactElement, useId } from 'react';

export function ModeIdInput(
    props: {
        modeId: number | undefined;
        onModeIdChange: (modeId: number | undefined) => void;
    }
): ReactElement {
    const modeIdId = useId();
    const MAX_MODE_ID = 0xFF;

    const handleModeIdChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const nextModeId = parseInt(event.target.value);
        if (isNaN(nextModeId) || nextModeId < 0 || nextModeId > MAX_MODE_ID) {
            props.onModeIdChange(undefined);
        } else {
            props.onModeIdChange(nextModeId);
        }
    };

    return (
        <>
            <label htmlFor={modeIdId}>Mode ID</label>
            <input type={'number'}
                   id={modeIdId}
                   value={props.modeId ?? ''}
                   onChange={handleModeIdChange}
                   min={0}
                   max={MAX_MODE_ID}
            />
        </>
    );
}
