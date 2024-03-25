import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { IHub, MotorServoEndState, MotorUseProfile, PortOperationStartupInformation } from 'rxpoweredup';

import { ServoOptionsForm, ServoOptionsFormResult } from '../common';

export function MotorPositionControls(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const nextOperationStartRef = useRef(new Subject<void>());
    const nextOperationStart$ = nextOperationStartRef.current;
    const [ servoOptions, setServoOptions ] = useState<ServoOptionsFormResult | undefined>({
        speed: 100,
        power: 100,
        useProfile: MotorUseProfile.dontUseProfiles,
        endState: MotorServoEndState.brake,
        noFeedback: false,
        bufferMode: PortOperationStartupInformation.bufferIfNecessary
    });

    useEffect(() => {
        return (): void => {
            dispose$.next();
            dispose$.complete();
        };
    }, [ dispose$ ]);

    const handleStep = (step: number): void => {
        if (!servoOptions || props.portId === undefined) {
            return;
        }
        nextOperationStart$.next();
        props.hub.motors.rotateByDegree(props.portId, step, servoOptions).pipe(
            takeUntil(dispose$),
            takeUntil(nextOperationStart$)
        ).subscribe();
    };

    const handleGoTo = (position: number): void => {
        if (!servoOptions || props.portId === undefined) {
            return;
        }
        nextOperationStart$.next();
        props.hub.motors.goToPosition(props.portId, position, servoOptions).pipe(
            takeUntil(dispose$),
            takeUntil(nextOperationStart$)
        ).subscribe();
    };

    const canExecute = servoOptions && props.portId !== undefined;

    return (
        <>
            <div>
                <ServoOptionsForm initialState={servoOptions}
                                  onChanges={setServoOptions}
                />
            </div>
            <button disabled={!canExecute}
                    onClick={(): void => handleStep(-90)}
            >
                Step -90
            </button>
            <button disabled={!canExecute}
                    onClick={(): void => handleStep(90)}
            >
                Step 90
            </button>
            <button disabled={!canExecute}
                    onClick={(): void => handleGoTo(0)}
            >
                Go to 0
            </button>
        </>
    );
}
