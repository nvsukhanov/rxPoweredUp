import { BluetoothDeviceWithGatt } from '../types';

export interface IHubScanner {
    discoverHub(): Promise<BluetoothDeviceWithGatt>;
}
