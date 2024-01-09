import { ChangeEvent, ReactElement, useId, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';

import { IHub } from 'rxpoweredup';

export function MotorEncoderControl(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const encoderOffsetInputId = useId();
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const [ encoderOffset, setEncoderOffset ] = useState<number | undefined>(0);
    const [ isCommandRunning, setIsCommandRunning ] = useState<boolean>(false);

    const handleEncoderOffsetChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        const value = parseInt(event.target.value);
        setEncoderOffset(isNaN(value) ? undefined : value);
    };

    const handleEncoderOffsetApply = (): void => {
        if (props.portId === undefined || encoderOffset === undefined) {
            return;
        }
        setIsCommandRunning(true);
        props.hub.motors.setZeroPositionRelativeToCurrentPosition(props.portId, encoderOffset).pipe(
            takeUntil(dispose$)
        ).subscribe({
            complete: () => {
                setIsCommandRunning(false);
            }
        });
    };

    const canExecute = props.portId !== undefined && encoderOffset !== undefined;

    return (
        <>
            <div>
                <label htmlFor={encoderOffsetInputId}>Encoder offset</label>
                <input id={encoderOffsetInputId}
                       disabled={isCommandRunning}
                       type="number"
                       value={encoderOffset}
                       onChange={handleEncoderOffsetChange}
                />
            </div>
            <div>
                <button type={'button'}
                        disabled={!canExecute}
                        onClick={handleEncoderOffsetApply}
                >
                    Apply
                </button>
            </div>
        </>
    );
}
