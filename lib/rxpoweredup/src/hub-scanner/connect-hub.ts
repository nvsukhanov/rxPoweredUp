import { Observable, map, switchMap } from 'rxjs';
import { container } from 'tsyringe';

import { HubConfig, HubFactory, IHub } from '../hub';
import { HubScannerFactory } from './hub-scanner-factory';
import { registerServices } from './register-service';

export function connectHub(
    bluetooth: Bluetooth,
    config?: Partial<HubConfig>
): Observable<IHub> {
    registerServices(config?.useLinuxWorkaround ?? false);
    const scannerFactory = container.resolve(HubScannerFactory).create(bluetooth);
    const hubFactory = container.resolve(HubFactory);
    return scannerFactory.discoverHub().pipe(
        map((device) => hubFactory.create(
            device,
            config
        )),
        switchMap((hub) => hub.connect().pipe(map(() => hub)))
    );
}
