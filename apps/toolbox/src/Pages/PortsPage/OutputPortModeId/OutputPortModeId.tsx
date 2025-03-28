import { Fragment, ReactElement } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { PortModeInformationType } from 'rxpoweredup';

import { PortModeInfoState, hashPortIdModeId, useHubStore } from '../../../Store';
import styles from './OutputPortModeId.module.scss';
import { PORT_MODE_INFORMATION_TYPES_LIST } from '../port-mode-information-types-list';

export function OutputPortModeId(props: {
  portId: number;
  modeId: number;
  onPortModeIdGetInfoRequest: (infoType: PortModeInformationType) => void;
}): ReactElement {
  const portModeInfo: PortModeInfoState | undefined = useHubStore(useShallow((state) => state.portModeInfo[hashPortIdModeId(props.portId, props.modeId)]));

  return (
    <section>
      <section className={styles['modeIdHeader']}>
        <div className={styles['modeIdTitle']}>Mode Id:</div>
        <div>{props.modeId}</div>
      </section>

      <dl className={styles['modeValuesContainer']}>
        {PORT_MODE_INFORMATION_TYPES_LIST.map((infoType) => {
          return (
            <Fragment key={infoType}>
              <dd>{PortModeInformationType[infoType]}</dd>
              <dt>
                {portModeInfo?.modeInfo[infoType] ? (
                  <>{JSON.stringify(portModeInfo.modeInfo[infoType] || null, null, 2)}</>
                ) : (
                  <button onClick={(): void => props.onPortModeIdGetInfoRequest(infoType)}>Get</button>
                )}
              </dt>
            </Fragment>
          );
        })}
      </dl>
    </section>
  );
}
