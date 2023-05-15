import { HUB_SERVICE_UUID } from '../constants';
import { BluetoothDeviceWithGatt } from '../types';
import { IHubScannerErrorFactory } from './i-hub-scanner-error-factory';
import { IHubScanner } from './i-hub-scanner';

export class HubScanner implements IHubScanner {
    constructor(
        private readonly hubScannerErrorFactory: IHubScannerErrorFactory,
        private readonly bluetoothApi: Bluetooth
    ) {
    }

    public async discoverHub(): Promise<BluetoothDeviceWithGatt> {
        let device: BluetoothDevice;

        try {
            device = await this.bluetoothApi.requestDevice({
                filters: [
                    { services: [ HUB_SERVICE_UUID ] }
                ]
            });
        } catch (e) {
            throw this.hubScannerErrorFactory.createConnectionCancelledByUserError();
        }

        if (!device) {
            throw this.hubScannerErrorFactory.createConnectionCancelledByUserError();
        }
        if (this.isDeviceWithGatt(device)) {
            return device;
        } else {
            throw this.hubScannerErrorFactory.createGattUnavailableError();
        }
    }

    private isDeviceWithGatt(device: BluetoothDevice | BluetoothDeviceWithGatt): device is BluetoothDeviceWithGatt {
        return !!device.gatt;
    }
}
