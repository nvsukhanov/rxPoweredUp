import { HUB_SERVICE_UUID } from './constants';
import { BluetoothDeviceWithGatt } from './types';
import { ConnectionErrorFactory } from './errors';

export class HubScanner {
    constructor(
        private readonly connectionErrorFactoryService: ConnectionErrorFactory,
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
            throw this.connectionErrorFactoryService.createConnectionCancelledByUserError();
        }

        if (!device) {
            throw this.connectionErrorFactoryService.createConnectionCancelledByUserError();
        }
        if (this.isDeviceWithGatt(device)) {
            return device;
        } else {
            throw this.connectionErrorFactoryService.createGattUnavailableError();
        }
    }

    private isDeviceWithGatt(device: BluetoothDevice | BluetoothDeviceWithGatt): device is BluetoothDeviceWithGatt {
        return !!device.gatt;
    }
}
