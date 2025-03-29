import { ReactElement } from 'react';
import { EMPTY, Observable } from 'rxjs';
import { HubType, IHub, VersionInformation } from 'rxpoweredup';

import styles from './HubPropertiesPage.module.scss';
import { HubSubscribableProperty } from './HubSubscribableProperty';
import { HubReadableProperty } from './HubReadableProperty';
import { HubSetAdvertisingName } from './HubSetAdvertisingName';
import { useHubStore } from '../../Store';
import { HubIsNotConnectedNotification } from '../../Components';

export function HubPropertiesPage(props: { hub: IHub | undefined }): ReactElement {
  const hubPropertiesState = useHubStore((state) => state.hubProperties);

  if (!props.hub) {
    return <HubIsNotConnectedNotification />;
  }

  return (
    <>
      <h2>Hub Properties</h2>
      <section className={`${styles['hubProperties']} ${styles['hubSection']}`}>
        <HubSubscribableProperty
          name={'Battery'}
          stateKey={'batteryLevel'}
          readValue={(): Observable<number> => props.hub?.properties.getBatteryLevel() ?? EMPTY}
          subscribeValue={(): Observable<number> => props.hub?.properties.batteryLevel ?? EMPTY}
          formatValue={(value?: number): string => (value !== undefined ? `${value}%` : 'Unknown')}
        />

        <HubSubscribableProperty
          name={'RSSI'}
          stateKey={'rssiLevel'}
          readValue={(): Observable<number> => props.hub?.properties.getRSSILevel() ?? EMPTY}
          subscribeValue={(): Observable<number> => props.hub?.properties.rssiLevel ?? EMPTY}
          formatValue={(value?: number): string => (value !== undefined ? `${value}` : 'Unknown')}
        />

        <HubSubscribableProperty
          name={'Button'}
          stateKey={'buttonState'}
          readValue={(): Observable<boolean> => props.hub?.properties.getButtonState() ?? EMPTY}
          subscribeValue={(): Observable<boolean> => props.hub?.properties.buttonState ?? EMPTY}
          formatValue={(value?: boolean): string =>
            value !== undefined ? (value ? 'Pressed' : 'Released') : 'Unknown'
          }
        />

        <HubReadableProperty
          name={'Advertising name'}
          stateKey={'advertisingName'}
          readValue={(): Observable<string> => props.hub?.properties.getAdvertisingName() ?? EMPTY}
          formatValue={(v?: string): string => (v !== undefined ? v : 'Unknown')}
        />

        <HubReadableProperty
          name={'System type'}
          stateKey={'systemTypeId'}
          readValue={(): Observable<HubType> => props.hub?.properties.getSystemTypeId() ?? EMPTY}
          formatValue={(v?: HubType): string => (v !== undefined ? HubType[v] : 'Unknown')}
        />

        <HubReadableProperty
          name={'Manufacturer'}
          stateKey={'manufacturerName'}
          readValue={(): Observable<string> => props.hub?.properties.getManufacturerName() ?? EMPTY}
          formatValue={(v?: string): string => (v !== undefined ? v : 'Unknown')}
        />

        <HubReadableProperty
          name={'Primary MAC address'}
          stateKey={'primaryMacAddress'}
          readValue={(): Observable<string> => props.hub?.properties.getPrimaryMacAddress() ?? EMPTY}
          formatValue={(v?: string): string => (v !== undefined ? v : 'Unknown')}
        />
        <HubReadableProperty
          name={'Firmware version'}
          stateKey={'firmwareVersion'}
          readValue={(): Observable<VersionInformation> => props.hub?.properties.getFirmwareVersion() ?? EMPTY}
          formatValue={(v?: VersionInformation): string =>
            v !== undefined ? `${v.major}.${v.minor}.${v.bugfix}.${v.build}` : 'Unknown'
          }
        />
        <HubReadableProperty
          name={'Hardware version'}
          stateKey={'hardwareVersion'}
          readValue={(): Observable<VersionInformation> => props.hub?.properties.getHardwareVersion() ?? EMPTY}
          formatValue={(v?: VersionInformation): string =>
            v !== undefined ? `${v.major}.${v.minor}.${v.bugfix}.${v.build}` : 'Unknown'
          }
        />
      </section>
      <h2>Set hub advertising name</h2>
      <section className={styles['hubSection']}>
        <HubSetAdvertisingName name={hubPropertiesState.advertisingName ?? ''} hub={props.hub}></HubSetAdvertisingName>
      </section>
    </>
  );
}
