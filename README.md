# rxPoweredUP

[![GitHub license](https://img.shields.io/github/license/nvsukhanov/rxpoweredup)](https://github.com/nvsukhanov/rxpoweredup/blob/main/LICENSE.md)
[![CI Status](https://github.com/nvsukhanov/rxpoweredup/actions/workflows/ci.yml/badge.svg)](https://github.com/nvsukhanov/rxpoweredup/actions)
[![NPM Version](https://img.shields.io/npm/v/@nvsukhanov/rxpoweredup.svg?style=flat)](https://www.npmjs.com/package/@nvsukhanov/rxpoweredup)

A Typescript RxJS-based library for controlling LEGO Powered UP MOCs.

Documentation can be found [here](https://nvsukhanov.github.io/rxPoweredUP)

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this application.

## Examples

Following examples use experimental navigator.bluetooth browser API to connect to Bluetooth devices, which is not yet
fully supported by all browsers.
Web Bluetooth API is not available in NodeJS, however, it is may by possible to use libraries which provide similar API.

Please note that browsers require user interaction for connecting to Bluetooth devices

reflect-metadata must be imported before using rxPoweredUP. This should be done only once in the application.

```typescript
import 'reflect-metadata';
```

### Async example

Wait for hub to connect, then wait for IO to attach to port 0, then if IO is a specific kind of motor, set speed to max
for 1 second.

```typescript
const bluetooth = navigator.bluetooth;
// connect to hub
const hub = await firstValueFrom(connectHub(bluetooth, { logLevel: LogLevel.Debug }));

// wait for IO to attach to port 0
const io = await firstValueFrom(hub.ports.onIoAttach(0));

// if IO is a specific motor, set speed to max for 1 second
if (io.ioTypeId === IOType.largeTechnicMotor) {
    await lastValueFrom(hub.motors.setSpeed(0, MOTOR_LIMITS.maxSpeed));
    setTimeout(async () => {
        await lastValueFrom(hub.motors.setSpeed(0, MOTOR_LIMITS.minSpeed));
        await lastValueFrom(hub.disconnect());
        console.log('done');
    }, 1000);
}
```

### Reactive example 1

Wait for hub to connect, then wait for IO to attach to port 0, then if IO is a specific kind of motor, set speed to max
for 1 second.

```typescript
const bluetooth = navigator.bluetooth;
connectHub(bluetooth, { logLevel: LogLevel.Debug }).pipe(
    mergeMap((hub) => hub.ports.onIoAttach(0).pipe(
        map((io) => ({ hub, ioType: io.ioTypeId }))
    )),
    filter(({ ioType }) => ioType === IOType.largeTechnicMotor),
    concatMap(({ hub }) => hub.motors.setSpeed(0, MOTOR_LIMITS.maxSpeed).pipe(
        map(() => hub)
    )),
    delay(1000),
    concatMap((hub) => hub.motors.setSpeed(0, MOTOR_LIMITS.minSpeed).pipe(
        map(() => hub))
    ),
    concatMap((hub) => hub.disconnect())
).subscribe({
    complete: () => console.log('done')
});
```

### Reactive example 2

Wait for hub to connect, then listen to IO attach events at any port, then if IO is a specific kind of motor, listen to
arrow up keypress and rotate/stop motor when key is pressed or released.

Motors and hubs can be connected and disconnected at any time. This example will work with any number of motors and
hubs.

```typescript
const bluetooth = navigator.bluetooth;
connectHub(bluetooth, { logLevel: LogLevel.Debug }).pipe(
    // listen to IO attach events at any port
    mergeMap((hub) => hub.ports.onIoAttach().pipe(
        map((attachEvent) => ({ hub, attachEvent }))
    )),
    // filter for specific motors
    filter(({ attachEvent }) => attachEvent.ioTypeId === IOType.largeTechnicMotor),
    // listen to keyup and keydown events and map to resulting speed
    mergeMap(({ hub, attachEvent }) => merge(
        fromEvent(document, 'keydown').pipe(
            filter((e: Event) => (e as KeyboardEvent).key === 'ArrowUp'),
            map(() => MOTOR_LIMITS.maxSpeed)
        ),
        fromEvent(document, 'keyup').pipe(
            filter((e: Event) => (e as KeyboardEvent).key === 'ArrowUp'),
            map(() => MOTOR_LIMITS.minSpeed)
        )
    ).pipe(
        distinctUntilChanged(),
        takeUntil(hub.disconnected),
        takeUntil(hub.ports.onIoDetach(attachEvent.portId)),
        map((speed) => ({ hub, port: attachEvent.portId, speed }))
    )),
    // execute command
    mergeMap(({ hub, port, speed }) => hub.motors.setSpeed(port, speed).pipe(
        map(() => ({ brr: !!speed, port })),
    ))
).subscribe((opResult) => {
    if (opResult.brr) {
        console.log(`motor at port ${opResult.port} goes brr`);
    } else {
        console.log(`motor at port ${opResult.port} stops`);
    }
});
```
