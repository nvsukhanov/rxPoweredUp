import { ReactElement, useState } from 'react';

import { IHub } from 'rxpoweredup';
import { HubNotConnectedNotification, PortIdInput } from '../common';
import { MotorPositionControls } from './Motor-position-controls.tsx';
import { MotorSpeedControls } from './Motor-speed-controls.tsx';
import { MotorAccelerationDecelerationTimings } from './Motor-acceleration-deceleration-timings.tsx';
import { MotorEncoderControl } from './Motor-encoder-control.tsx';
import { MotorPositionInfo } from './Motor-position-info.tsx';
import styles from './Motor-page.module.scss';

export function MotorPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    const [ portId, setPortId ] = useState<number | undefined>(0);

    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }
    return (
        <>
            <section>
                <h2>Port</h2>
                <div className={styles.featureSection}>
                    <PortIdInput portId={portId} onPortIdChange={setPortId}/>
                </div>
            </section>
            <section>
                <h2>Acceleration & deceleration profiles</h2>
                <div className={styles.featureSection}>
                    <MotorAccelerationDecelerationTimings hub={props.hub} port={portId}/>
                </div>
            </section>
            <section>
                <h2>Position controls</h2>
                <div className={styles.featureSection}>
                    <MotorPositionControls hub={props.hub}
                                           portId={portId}
                    ></MotorPositionControls>
                </div>
            </section>
            <section>
                <h2>Position read</h2>
                <div className={styles.featureSection}>
                    <MotorPositionInfo hub={props.hub}
                                       portId={portId}
                    ></MotorPositionInfo>
                </div>
            </section>
            <section>
                <h2>Speed controls</h2>
                <div className={styles.featureSection}>
                    <MotorSpeedControls hub={props.hub}
                                        portId={portId}
                    ></MotorSpeedControls>
                </div>
            </section>
            <section>
                <h2>Encoder</h2>
                <div className={styles.featureSection}>
                    <MotorEncoderControl hub={props.hub}
                                         portId={portId}
                    ></MotorEncoderControl>
                </div>
            </section>
        </>
    );
}
