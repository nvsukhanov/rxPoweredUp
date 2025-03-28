import { Observable } from 'rxjs';

import { BluetoothDeviceWithGatt } from '../types';

export interface IHubScanner {
  discoverHub(): Observable<BluetoothDeviceWithGatt>;
}
