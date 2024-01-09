import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, finalize, takeUntil } from 'rxjs';

import { IHub, PortModeName, ValueTransformers, WELL_KNOWN_PORT_MODE_IDS } from 'rxpoweredup';
import { MotorPositionInfoItem } from './Motor-position-info-item.tsx';

export function MotorPositionInfo(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const [ posModeId, setPosModeId ] = useState<number | undefined>(WELL_KNOWN_PORT_MODE_IDS.motor.POS);
    const [ aposModeId, setAposModeId ] = useState<number | undefined>(WELL_KNOWN_PORT_MODE_IDS.motor.APOS);

    const [ pos, setPos ] = useState<number | undefined>(undefined);
    const [ apos, setApos ] = useState<number | undefined>(undefined);

    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const unsubscribeRef = useRef(new Subject<void>());
    const unsubscribe$ = unsubscribeRef.current;

    const [ isCommandRunning, setIsCommandRunning ] = useState<boolean>(false);
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);

    useEffect(() => {
        return (): void => {
            dispose$.next();
            dispose$.complete();
        };
    }, [ dispose$ ]);

    const handlePosRead = (readType: PortModeName.position | PortModeName.absolutePosition): void => {
        const modeId = readType === PortModeName.position ? posModeId : aposModeId;
        if (props.portId === undefined || modeId === undefined || isCommandRunning || isSubscribed) {
            return;
        }
        const valueTransformer = readType === PortModeName.position ? ValueTransformers.position : ValueTransformers.absolutePosition;
        const setter = readType === PortModeName.position ? setPos : setApos;
        setIsCommandRunning(true);
        props.hub.ports.getPortValue(props.portId, modeId, valueTransformer).pipe(
            takeUntil(dispose$)
        ).subscribe({
            next: setter,
            complete: () => setIsCommandRunning(false)
        });
    };

    const handleSubscribe = (readType: PortModeName.position | PortModeName.absolutePosition): void => {
        const modeId = readType === PortModeName.position ? posModeId : aposModeId;
        if (props.portId === undefined || modeId === undefined || isCommandRunning || isSubscribed) {
            return;
        }
        const valueTransformer = readType === PortModeName.position ? ValueTransformers.position : ValueTransformers.absolutePosition;
        const setter = readType === PortModeName.position ? setPos : setApos;
        setIsSubscribed(true);
        props.hub.ports.portValueChanges(props.portId, modeId, 1, valueTransformer).pipe(
            takeUntil(dispose$),
            takeUntil(unsubscribe$),
            finalize(() => setIsSubscribed(false))
        ).subscribe(setter);
    };

    const handleUnsubscribe = (): void => {
        unsubscribe$.next();
    };

    const canEditMode = !isCommandRunning && !isSubscribed;
    const canRead = !isCommandRunning && !isSubscribed && props.portId !== undefined;
    const canSubscribe = !isCommandRunning && !isSubscribed && props.portId !== undefined;
    const canUnsubscribe = isSubscribed;

    return (
        <>
            <section>
                <h3>Position</h3>
                <MotorPositionInfoItem canEditMode={canEditMode}
                                       canRead={canRead}
                                       canSubscribe={canSubscribe}
                                       canUnsubscribe={canUnsubscribe}
                                       modeId={posModeId}
                                       value={pos}
                                       modeIdChange={setPosModeId}
                                       read={(): void => handlePosRead(PortModeName.position)}
                                       subscribe={(): void => handleSubscribe(PortModeName.position)}
                                       unsubscribe={(): void => handleUnsubscribe()}
                ></MotorPositionInfoItem>
            </section>
            <section>
                <h3>Absolute position</h3>
                <MotorPositionInfoItem canEditMode={canEditMode}
                                       canRead={canRead}
                                       canSubscribe={canSubscribe}
                                       canUnsubscribe={canUnsubscribe}
                                       modeId={aposModeId}
                                       value={apos}
                                       modeIdChange={setAposModeId}
                                       read={(): void => handlePosRead(PortModeName.absolutePosition)}
                                       subscribe={(): void => handleSubscribe(PortModeName.absolutePosition)}
                                       unsubscribe={(): void => handleUnsubscribe()}
                ></MotorPositionInfoItem>
            </section>
        </>
    );
}
