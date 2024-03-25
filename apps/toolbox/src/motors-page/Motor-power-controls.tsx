import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { IHub, PortModeName, WELL_KNOWN_PORT_MODE_IDS } from 'rxpoweredup';

import { ModeIdInput, PowerInput } from '../common';

export function MotorPowerControls(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const [ modeId, setModeId ] = useState<number | undefined>(WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.power]);
    const [ power, setPower ] = useState<number | undefined>(100);
    const dispose$ = useRef(new Subject<void>());

    const execute = (): void => {
        if (modeId === undefined || power === undefined || props.portId === undefined) {
            return;
        }
        props.hub.motors.startPower(props.portId, power, modeId).pipe(
            takeUntil(dispose$.current)
        ).subscribe();
    };

    useEffect(() => {
        return (): void => {
            dispose$.current.next();
            dispose$.current.complete();
        };
    }, [ dispose$.current ]);

    return (
        <>
            <div>
                <ModeIdInput modeId={modeId} onModeIdChange={setModeId}/>
            </div>
            <div>
                <PowerInput power={power} onPowerChange={setPower}/>
            </div>
            <div>
                <button disabled={props.portId === undefined || modeId === undefined || power === undefined}
                        onClick={execute}
                >
                    Execute
                </button>
            </div>
        </>
    );
}
