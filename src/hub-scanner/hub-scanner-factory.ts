import { container, injectable } from 'tsyringe';

import { HubScanner } from './hub-scanner';
import { ConnectionErrorFactory } from '../errors';
import { IHubScanner } from './i-hub-scanner';

@injectable()
export class HubScannerFactory {
    public create(
        bluetooth: Bluetooth,
    ): IHubScanner {
        return new HubScanner(
            container.resolve(ConnectionErrorFactory),
            bluetooth,
        );
    }
}
