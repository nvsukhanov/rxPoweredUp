import { ChangeEvent, ReactElement, useId, useState } from 'react';

export function MotorPositionInfoItem(
    props: {
        canEditMode: boolean;
        canRead: boolean;
        canSubscribe: boolean;
        canUnsubscribe: boolean;
        modeId: number | undefined;
        value: number | undefined;
        modeIdChange: (modeId: number | undefined) => void;
        read: () => void;
        subscribe: () => void;
        unsubscribe: () => void;
    }
): ReactElement {
    const modeIdId = useId();
    const [ modeId, setModeId ] = useState<string>(props.modeId?.toString() ?? '');

    const handleModeIdChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setModeId(event.target.value);
        const value = parseInt(event.target.value);
        props.modeIdChange(isNaN(value) ? undefined : value);
    };

    return (
        <>
            <div>
                <label htmlFor={modeIdId}>Mode id</label>
                <input type={'number'}
                       id={modeIdId}
                       disabled={!props.canEditMode}
                       value={modeId}
                       onChange={(e): void => handleModeIdChange(e)}
                />
            </div>
            <div>
                Value: {props.value === undefined ? 'N/A' : props.value}
            </div>
            <div>
                <button type={'button'}
                        disabled={!props.canRead}
                        onClick={props.read}
                >
                    Read
                </button>
                <button type={'button'}
                        disabled={!props.canSubscribe}
                        onClick={props.subscribe}
                >
                    Subscribe
                </button>
                <button type={'button'}
                        disabled={!props.canUnsubscribe}
                        onClick={props.unsubscribe}
                >
                    Unsubscribe
                </button>
            </div>
        </>
    );
}
