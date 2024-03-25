import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Observable, Subject, concat, take, takeUntil } from 'rxjs';
import { IHub, PortOperationStartupInformation } from 'rxpoweredup';

import { MotorBufferModeSelect, NoFeedbackInput, PortIdInput } from '../common';

export function BurstTest(
    props: {
        hub: IHub | undefined;
        updateSequenceDuration: (index: number, value: number | null) => void;
        onStart: (sequeceLength: number) => void;
    }
): ReactElement {
    const [ burstLength, setBurstLength ] = useState(10);
    const [ bufferMode, setBufferMode ] = useState<PortOperationStartupInformation>(PortOperationStartupInformation.bufferIfNecessary);
    const [ noFeedback, setNoFeedback ] = useState(false);
    const [ portId, setPortId ] = useState<number | undefined>(0);
    const disposeRef$ = useRef(new Subject<void>());
    const dispose$ = disposeRef$.current;

    useEffect(() => {
        return () => dispose$.next();
    }, [ dispose$ ]);

    const execute = useCallback((): void => {
        disposeRef$.current.next();
        if (portId === undefined || !props.hub) {
            return;
        }
        const tasks = Array.from({ length: burstLength }, (_, index) => {
            return new Observable((subscriber) => {
                const start = Date.now();
                if (!props.hub) {
                    subscriber.complete();
                    return;
                }
                const sub = props.hub.motors.startSpeed(
                    portId,
                    index,
                    { bufferMode, noFeedback }
                ).pipe(
                    take(1),
                    takeUntil(disposeRef$.current)
                ).subscribe({
                    next: () => subscriber.next(),
                    complete: () => {
                        props.updateSequenceDuration(index, Date.now() - start);
                        subscriber.complete();
                    }
                });
                return () => {
                    sub.unsubscribe();
                };
            });
        });

        props.onStart(burstLength);

        concat(
            ...tasks,
            props.hub.motors.startSpeed(portId, 0, { bufferMode, noFeedback })
        ).pipe(
            takeUntil(disposeRef$.current),
        ).subscribe();
    }, [ portId, props, burstLength, bufferMode, noFeedback ]);

    return (
        <>
            <div>
                <PortIdInput portId={portId} onPortIdChange={setPortId}/>
            </div>
            <div>
                Burst sequence length:
                <input type={'range'}
                       min={1}
                       max={100}
                       value={burstLength}
                       onChange={(event) => setBurstLength(parseInt(event.target.value))}
                />
                {burstLength}
            </div>
            <div>
                <MotorBufferModeSelect bufferMode={bufferMode} onBufferModeChange={setBufferMode}/>
            </div>
            <div>
                <NoFeedbackInput noFeedback={noFeedback} onNoFeedbackChange={setNoFeedback}/>
            </div>
            <div>
                <button onClick={execute}
                        disabled={portId === undefined || !props.hub}
                >Execute
                </button>
            </div>
        </>
    );
}
