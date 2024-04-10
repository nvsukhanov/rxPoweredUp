import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { ColorDescriptor, IHub, WELL_KNOWN_PORT_MODE_IDS } from 'rxpoweredup';

import { ColorInput, ModeIdInput, PortIdInput } from '../../components';

export function LedColor(
    props: {
        hub?: IHub;
    }
): ReactElement {
    const [ portId, setPortId ] = useState<number | undefined>(0);
    const [ modeId, setModeId ] = useState<number | undefined>(WELL_KNOWN_PORT_MODE_IDS.rgbLightRgbColor);
    const [ color, setColor ] = useState<ColorDescriptor | undefined>({ red: 255, green: 255, blue: 255 });
    const dispose$ = useRef(new Subject<void>());

    useEffect(() => {
        dispose$.current.next();
    }, [ dispose$ ]);

    const updateLedColor = (): void => {
        if (!props.hub || portId === undefined || modeId === undefined || color === undefined) {
            return;
        }
        props.hub.rgbLight.setRgbColor(portId, color, modeId).pipe(
            takeUntil(dispose$.current)
        ).subscribe();
    };

    return (
        props?.hub
        ? <>
            <div>
                <PortIdInput portId={portId} onPortIdChange={setPortId}/>
            </div>
            <div>
                <ModeIdInput modeId={modeId} onModeIdChange={setModeId}/>
            </div>
            <div>
                <ColorInput color={color} onColorChange={setColor}/>
            </div>

            <button onClick={updateLedColor}
                    disabled={portId === undefined || modeId === undefined || color === undefined}
            >Set color
            </button>
        </>
        : <>Hub is not connected</>
    );
}
