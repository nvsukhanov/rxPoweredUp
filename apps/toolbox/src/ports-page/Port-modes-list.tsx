import { Fragment, ReactElement } from 'react';

import { IHub } from 'rxpoweredup';
import styles from './Port-mode.module.scss';
import { PortModeState, useHubStore } from '../store';
import { InputPortModeId } from './Input-port-mode-id';
import { OutputPortModeId } from './Output-port-mode-id';

export function PortModesList(
    props: {
        hub: IHub;
        portId: number;
        portModeState: PortModeState;
    }
): ReactElement {
    const processPortModeInformationMessage = useHubStore((state) => state.processPortModeInformationMessage);
    const processPortModeInformationRequestError = useHubStore((state) => state.processPortModeInformationRequestError);

    const handlePortModeInfoRequest = (modeId: number, infoType: number): void => {
        props.hub?.ports.getPortModeInformation(props.portId, modeId, infoType).subscribe({
            next: (r) => processPortModeInformationMessage(r),
            error: (e) => processPortModeInformationRequestError(props.portId, modeId, infoType, e)
        });
    };

    return (
        <section>
            <section>
                <div>
                    <span className={styles.valueTitle}>Logical combinable:</span>
                    <span> {props.portModeState.capabilities.logicalCombinable ? 'yes' : 'no'}</span>
                </div>
                <div>
                    <span className={styles.valueTitle}>Logical synchronizable:</span>
                    <span> {props.portModeState.capabilities.logicalSynchronizable ? 'yes' : 'no'}</span>
                </div>
            </section>
            {
                props.portModeState.inputModes.length > 0 &&
                <section>
                    <div className={styles.valueTitle}>Input modes:</div>
                    <section className={styles.modesList}>
                        {props.portModeState.inputModes.map((modeId, idx) => <Fragment key={idx}>
                            <InputPortModeId hub={props.hub}
                                             portId={props.portId}
                                             modeId={modeId}
                                             onPortModeIdGetInfoRequest={(infoType): void => handlePortModeInfoRequest(modeId, infoType)}
                            ></InputPortModeId>
                        </Fragment>)}
                    </section>
                </section>
            }
            {
                props.portModeState.outputModes.length > 0 &&
                <section className={styles.modesSection}>
                    <div className={styles.valueTitle}>Output modes:</div>
                    <section className={styles.modesList}>
                        {props.portModeState.outputModes.map((modeId, idx) => <Fragment key={idx}>
                            <OutputPortModeId portId={props.portId}
                                              modeId={modeId}
                                              onPortModeIdGetInfoRequest={(infoType): void => handlePortModeInfoRequest(modeId, infoType)}
                            />
                        </Fragment>)}
                    </section>
                </section>
            }
        </section>
    );
}
