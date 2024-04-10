import { ChangeEvent, Fragment, ReactElement, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { IHub, IPortValueTransformer, PortModeInformationType, ValueTransformers } from 'rxpoweredup';

import { PortModeInfoState, PortValuesState, hashPortIdModeId, useHubStore } from '../../../Store';
import { numberFromLeArray, numberToHex } from '../../../Common';
import styles from './InputPortModeId.module.scss';
import { PORT_MODE_INFORMATION_TYPES_LIST } from '../port-mode-information-types-list';

export function InputPortModeId(
    props: {
        hub: IHub;
        portId: number;
        modeId: number;
        onPortModeIdGetInfoRequest: (infoType: PortModeInformationType) => void;
    }
): ReactElement {
    const hubType = useHubStore(useShallow((state) => state.hubProperties?.systemTypeId));
    const portModeInfo: PortModeInfoState | undefined = useHubStore(useShallow((state) => state.portModeInfo[hashPortIdModeId(props.portId, props.modeId)]));
    const portValues: PortValuesState | undefined = useHubStore(useShallow((state) => state.portValues[hashPortIdModeId(props.portId, props.modeId)]));
    const processPortRawValue = useHubStore((state) => state.processPortRawValue);
    const processPortValue = useHubStore((state) => state.processPortValue);

    const [ transformerIdx, setTransformerIdx ] = useState<number>(0);

    const rawValue = portValues?.rawValue;
    const rawNumber = rawValue && numberFromLeArray(rawValue);
    const rawNumberHex = rawValue && rawValue.map((byte) => numberToHex(byte)).join(' ');
    const transformers: Array<{ name: string; transformer: IPortValueTransformer<unknown> }> = [
        { name: 'absolute position', transformer: ValueTransformers.absolutePosition },
        { name: 'tilt', transformer: ValueTransformers.tilt },
        { name: 'position', transformer: ValueTransformers.position },
        { name: 'color', transformer: ValueTransformers.color },
    ];
    if (hubType !== undefined) {
        transformers.push({ name: 'voltage', transformer: ValueTransformers.voltage(hubType) });
    }

    const handleTransformersChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setTransformerIdx(parseInt(e.target.value));
    };

    const handleReadRawPortValueRequest = (): void => {
        props.hub?.ports.getPortValue(
            props.portId,
            props.modeId
        ).subscribe((r) => processPortRawValue(
            props.portId,
            props.modeId,
            r
        ));
    };

    const handleReadPortValueRequest = (): void => {
        const transformer = transformers[transformerIdx].transformer;
        if (transformer) {
            props.hub?.ports.getPortValue(
                props.portId,
                props.modeId,
                transformer
            ).subscribe((r) => processPortValue(
                props.portId,
                props.modeId,
                JSON.stringify(r, null, 2)
            ));
        }
    };

    return (
        <section>
            <section className={styles['modeIdHeader']}>
                <div className={styles['modeIdTitle']}>Mode Id:</div>
                <div>{props.modeId}</div>
            </section>

            <dl className={styles['modeValuesContainer']}>
                <dd>Raw value</dd>
                <dt className={styles['portValuesContainer']}>
                    <div>
                        <button onClick={handleReadRawPortValueRequest}>Read</button>
                    </div>
                    <div>
                        {
                            rawValue
                            && <dl className={styles['rawValueResultsContainer']}>
                                <dt>Numeric:</dt>

                                <dd>{rawNumber}</dd>
                                <dt>Raw:</dt>
                                <dd>{JSON.stringify(rawValue, null, 2)}</dd>
                                <dt>Hex:</dt>
                                <dd>{rawNumberHex}</dd>
                            </dl>
                        }
                    </div>
                </dt>

                <dd>Value</dd>
                <dt className={styles['portValuesContainer']}>
                    <div>
                        as
                    </div>
                    <div>
                        <select value={transformerIdx}
                                onChange={handleTransformersChange}
                        >
                            {
                                transformers.map((t, idx) => <option key={t.name} value={idx}>{t.name}</option>)
                            }
                        </select>
                    </div>
                    <div>
                        <button onClick={handleReadPortValueRequest}>Read</button>
                    </div>
                    <div>
                        {portValues?.parsedValue !== undefined
                         ? portValues.parsedValue
                         : '---'}
                    </div>
                </dt>

                {
                    PORT_MODE_INFORMATION_TYPES_LIST.map((infoType) => {
                        return (
                            <Fragment key={infoType}>
                                <dd>{PortModeInformationType[infoType]}</dd>
                                <dt>{
                                    portModeInfo?.modeInfo[infoType]
                                    ? <>{JSON.stringify(portModeInfo.modeInfo[infoType] || null, null, 2)}</>
                                    : <button onClick={(): void => props.onPortModeIdGetInfoRequest(infoType)}>Get</button>
                                }</dt>
                            </Fragment>
                        );
                    })
                }
            </dl>
        </section>
    );
}
