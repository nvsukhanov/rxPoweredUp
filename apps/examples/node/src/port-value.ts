/* eslint-disable no-console */
import { audit, lastValueFrom, switchMap, takeUntil, tap } from 'rxjs';
import { bluetooth } from 'webbluetooth';
import { LogLevel, PortModeName, ValueTransformers, WELL_KNOWN_PORT_MODE_IDS, connectHub } from 'rxpoweredup';

import { waitForPromise } from './wait-for-promise';

console.log('Waiting for Hub...');

const sequence = lastValueFrom(
    connectHub(bluetooth, {
        logLevel: LogLevel.Debug
    }).pipe(
        audit((hub) => hub.ports.onIoAttach({ ports: [ 0 ] })),
        switchMap((hub) => hub.ports.portValueChanges(
            0,
            WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.position],
            1,
            ValueTransformers.position
        ).pipe(
            takeUntil(hub.disconnected),
        )),
        tap((position) => console.log(`Position: ${position}`))
    )
);

waitForPromise(sequence);
