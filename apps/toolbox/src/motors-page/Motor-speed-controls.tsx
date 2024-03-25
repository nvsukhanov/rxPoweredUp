import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { IHub, MOTOR_LIMITS, MotorUseProfile, PortOperationStartupInformation } from 'rxpoweredup';

import { SpeedInput, SpeedOptionsForm, SpeedOptionsFormResult } from '../common';

export function MotorSpeedControls(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const nextOperationStartRef = useRef(new Subject<void>());
    const nextOperationStart$ = nextOperationStartRef.current;
    const [ speedOptions, setSpeedOptions ] = useState<SpeedOptionsFormResult | undefined>({
        power: MOTOR_LIMITS.maxPower,
        useProfile: MotorUseProfile.dontUseProfiles,
        noFeedback: false,
        bufferMode: PortOperationStartupInformation.bufferIfNecessary
    });
    const [ speed, setSpeed ] = useState<number | undefined>(100);

    useEffect(() => {
        return (): void => {
            dispose$.next();
            dispose$.complete();
        };
    }, [ dispose$ ]);

    const handleQuickSetSpeed = (v: number, power?: number): void => {
        if (!speedOptions || props.portId === undefined) {
            return;
        }
        nextOperationStart$.next();
        props.hub.motors.startSpeed(props.portId, v, {
            ...speedOptions,
            power: power !== undefined ? power : speedOptions.power
        }).pipe(
            takeUntil(dispose$),
            takeUntil(nextOperationStart$)
        ).subscribe();
    };

    const handleSetSpeed = (): void => {
        if (!speedOptions || speed === undefined || props.portId === undefined) {
            return;
        }
        nextOperationStart$.next();
        props.hub.motors.startSpeed(props.portId, speed, speedOptions).pipe(
            takeUntil(dispose$),
            takeUntil(nextOperationStart$)
        ).subscribe();
    };

    const canExecute = speedOptions && props.portId !== undefined;

    return (
        <>
            <div>
                <div>
                    <SpeedOptionsForm initialState={speedOptions}
                                      onChanges={setSpeedOptions}
                    />
                </div>
                <div>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(-100)}
                    >
                        -100
                    </button>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(-50)}
                    >
                        -50
                    </button>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(0, 0)}
                    >
                        0 (float)
                    </button>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(0, 100)}
                    >
                        0 (brake)
                    </button>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(50)}
                    >
                        50
                    </button>
                    <button disabled={!canExecute}
                            onClick={(): void => handleQuickSetSpeed(100)}
                    >
                        100
                    </button>
                </div>
            </div>
            <div>
                <SpeedInput speed={speed} onSpeedChange={setSpeed}/>
                <button disabled={!canExecute}
                        onClick={handleSetSpeed}
                >
                    Set speed
                </button>
            </div>
        </>
    );
}
