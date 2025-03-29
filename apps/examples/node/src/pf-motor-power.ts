/* eslint-disable no-console */
import { audit, concat, lastValueFrom, switchMap, timer } from 'rxjs';
import { bluetooth } from 'webbluetooth';
import { LogLevel, PortModeName, WELL_KNOWN_PORT_MODE_IDS, connectHub } from 'rxpoweredup';

import { waitForPromise } from './wait-for-promise';

console.log('Waiting for Hub...');

const sequence = lastValueFrom(
  connectHub(bluetooth, {
    logLevel: LogLevel.Debug,
  }).pipe(
    audit((hub) => hub.ports.onIoAttach({ ports: [0] })),
    switchMap((hub) =>
      concat(
        hub.motors.startPower(0, 100, WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.lpf2MMotor]),
        timer(1000),
        hub.motors.startPower(0, -100, WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.lpf2MMotor]),
        timer(1000),
        hub.motors.startPower(0, 0, WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.lpf2MMotor]),
        hub.switchOff()
      )
    )
  )
);

waitForPromise(sequence);
