import { Observable, from, map } from 'rxjs';

import { HUB_SERVICE_UUID } from '../constants';
import { BluetoothDeviceWithGatt } from '../types';
import { IHubScannerErrorFactory } from './i-hub-scanner-error-factory';
import { IHubScanner } from './i-hub-scanner';

export class HubScanner implements IHubScanner {
  constructor(private readonly hubScannerErrorFactory: IHubScannerErrorFactory, private readonly bluetoothApi: Bluetooth) {}

  public discoverHub(): Observable<BluetoothDeviceWithGatt> {
    return from(
      this.bluetoothApi.requestDevice({
        filters: [{ services: [HUB_SERVICE_UUID] }],
      })
    ).pipe(
      map((device) => {
        if (this.isDeviceWithGatt(device)) {
          return device;
        } else {
          throw this.hubScannerErrorFactory.createGattUnavailableError();
        }
      })
    );
  }

  private isDeviceWithGatt(device: BluetoothDevice | BluetoothDeviceWithGatt): device is BluetoothDeviceWithGatt {
    return !!device.gatt;
  }
}
