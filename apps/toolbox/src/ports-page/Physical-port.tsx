import { ReactElement } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { IHub, IOType } from 'rxpoweredup';
import styles from './Physical-port.module.scss';
import { PhysicalPortState, PortModeState, useHubStore } from '../store';
import { PortModesList } from './Port-modes-list';

export function PhysicalPort(
    props: {
        hub: IHub;
        port: PhysicalPortState;
        onHandlePortModesRequest: () => void;
    }
): ReactElement {
    const portModeState: PortModeState | undefined = useHubStore(useShallow((state) => state.portModes[props.port.portId]));

    return (
        <>
            <section className={styles['portData']}>
                <div className={styles['portName']}>Port {props.port.portId}</div>
                <div>{IOType[props.port.ioType]}</div>
                <div>HW rev. {props.port.hardwareRevision}</div>
                <div>SW rev. {props.port.softwareRevision}</div>
            </section>
            <section className={styles['portModeData']}>
                {
                    portModeState
                    ? <PortModesList hub={props.hub}
                                     portId={props.port.portId}
                                     portModeState={portModeState}
                    ></PortModesList>
                    : <button onClick={props.onHandlePortModesRequest}>Get port modes info</button>
                }
            </section>
        </>
    );
}
