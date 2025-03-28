/* eslint-disable no-console */
import { audit, concat, lastValueFrom, switchMap, timer } from 'rxjs';
import { bluetooth } from 'webbluetooth';
import { LogLevel, connectHub } from 'rxpoweredup';

import { waitForPromise } from './wait-for-promise';

console.log('Waiting for Hub...');

const sequence = lastValueFrom(
  connectHub(bluetooth, {
    logLevel: LogLevel.Debug,
  }).pipe(
    audit((hub) => hub.ports.onIoAttach({ ports: [0] })),
    switchMap((hub) => concat(hub.motors.startSpeed(0, 100), timer(1000), hub.motors.startSpeed(0, 0), hub.switchOff()))
  )
);

waitForPromise(sequence);
