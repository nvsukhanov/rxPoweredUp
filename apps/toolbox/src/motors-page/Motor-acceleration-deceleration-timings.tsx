import { ChangeEvent, ReactElement, useId, useState } from 'react';
import { concatWith } from 'rxjs';

import { IHub } from 'rxpoweredup';

export function MotorAccelerationDecelerationTimings(
    props: {
        hub: IHub;
        port: number | undefined;
    }
): ReactElement {
    const accelerationTimeMsId = useId();
    const decelerationTimeMsId = useId();
    const [ accelerationTimeMs, setAccelerationTimeMs ] = useState<number>(1000);
    const [ decelerationTimeMs, setDecelerationTimeMs ] = useState<number>(1000);
    const [ isInProgress, setIsInProgress ] = useState<boolean>(false);

    const isValid = (): boolean => props.port !== undefined
        && accelerationTimeMs >= 0 && accelerationTimeMs <= 10000
        && decelerationTimeMs >= 0 && decelerationTimeMs <= 10000;

    const handleApply = (): void => {
        if (props.port !== undefined) {
            setIsInProgress(true);
            props.hub.motors.setAccelerationTime(props.port, accelerationTimeMs).pipe(
                concatWith(props.hub.motors.setDecelerationTime(props.port, decelerationTimeMs))
            ).subscribe({
                complete: () => setIsInProgress(false)
            });
        }
    };

    return (
        <>
            <div>
                <label htmlFor={accelerationTimeMsId}>Acceleration time (ms)</label>
                <input type="number"
                       id={accelerationTimeMsId}
                       value={accelerationTimeMs}
                       onChange={(event: ChangeEvent): void => setAccelerationTimeMs(parseInt((event.target as HTMLInputElement).value))}
                       min={0}
                       max={10000}
                />
            </div>
            <div>
                <label htmlFor={decelerationTimeMsId}>Deceleration time (ms)</label>
                <input type="number"
                       id={decelerationTimeMsId}
                       value={decelerationTimeMs}
                       onChange={(event: ChangeEvent): void => setDecelerationTimeMs(parseInt((event.target as HTMLInputElement).value))}
                       min={0}
                       max={10000}
                />
            </div>
            <div>
                <button disabled={!isValid() || isInProgress}
                        onClick={handleApply}
                >
                    Apply
                </button>
            </div>
        </>
    );
}
