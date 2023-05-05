import { container, injectable } from 'tsyringe';
import { HubScanner } from './hub-scanner';
import { ConnectionErrorFactory } from './errors';

@injectable()
export class HubScannerFactory {
    public create(
        bluetooth: Bluetooth,
    ): HubScanner {
        return new HubScanner(
            container.resolve(ConnectionErrorFactory),
            bluetooth,
        );
    }
}
