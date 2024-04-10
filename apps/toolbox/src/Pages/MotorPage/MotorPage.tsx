import { ReactElement, useState } from 'react';
import { IHub } from 'rxpoweredup';

import { PositionControl } from './PositionControl';
import { SpeedControl } from './SpeedControl';
import { AccelerationDecelerationTimings } from './AccelerationDecelerationTimings';
import { EncoderControl } from './EncoderControl';
import { PositionInfo } from './PositionInfo';
import styles from './MotorPage.module.scss';
import { ServoSequence } from './ServoSequence';
import { PowerControl } from './PowerControl';
import { HubIsNotConnectedNotification, PortIdInput } from '../../Components';

export function MotorPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    const [ portId, setPortId ] = useState<number | undefined>(0);

    if (!props.hub) {
        return (<HubIsNotConnectedNotification/>);
    }
    return (
        <>
            <section>
                <h2>Port</h2>
                <div className={styles['featureSection']}>
                    <PortIdInput portId={portId} onPortIdChange={setPortId}/>
                </div>
            </section>
            <section>
                <h2>Acceleration & deceleration profiles</h2>
                <div className={styles['featureSection']}>
                    <AccelerationDecelerationTimings hub={props.hub} port={portId}/>
                </div>
            </section>
            <section>
                <h2>Position controls</h2>
                <div className={styles['featureSection']}>
                    <PositionControl hub={props.hub}
                                     portId={portId}
                    ></PositionControl>
                </div>
            </section>
            <section>
                <h2>Position read</h2>
                <div className={styles['featureSection']}>
                    <PositionInfo hub={props.hub}
                                  portId={portId}
                    ></PositionInfo>
                </div>
            </section>
            <section>
                <h2>Speed controls</h2>
                <div className={styles['featureSection']}>

                    <SpeedControl hub={props.hub}
                                  portId={portId}
                    ></SpeedControl>
                </div>
            </section>
            <section>
                <h2>Encoder</h2>
                <div className={styles['featureSection']}>
                    <EncoderControl hub={props.hub}
                                    portId={portId}
                    ></EncoderControl>
                </div>
            </section>
            <section>
                <h2>Servo sequence</h2>
                <div className={styles['featureSection']}>
                    <ServoSequence hub={props.hub}
                                   portId={portId}
                    ></ServoSequence>
                </div>
            </section>
            <section>
                <h2>Motor power controls (write direct)</h2>
                <div className={styles['featureSection']}>
                    <PowerControl hub={props.hub}
                                  portId={portId}
                    ></PowerControl>
                </div>
            </section>
        </>
    );
}
