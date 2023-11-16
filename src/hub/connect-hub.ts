import { Observable, map, switchMap } from 'rxjs';
import { container } from 'tsyringe';

import { HubConfig } from './hub-config';
import { IHub } from './i-hub';
import { HubScannerFactory } from '../hub-scanner';
import { HubFactory } from './hub-factory';

export function connectHub(
    bluetooth: Bluetooth,
    config?: Partial<HubConfig>
): Observable<IHub> {
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
