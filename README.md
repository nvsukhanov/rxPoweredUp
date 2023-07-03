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

### Async example

```typescript
async function test(): Promise<void> {
    const hub = await firstValueFrom(connectHub(navigator.bluetooth));
    await firstValueFrom(hub.ports.onIoAttach({
        ports: [ 0 ],
        ioTypes: [ IOType.largeTechnicMotor ]
    }));
    await lastValueFrom(hub.motors.setSpeed(0, MOTOR_LIMITS.maxSpeed));
    await lastValueFrom(timer(1000));
    await lastValueFrom(hub.motors.setSpeed(0, MOTOR_LIMITS.minSpeed));
    await lastValueFrom(hub.disconnect());
}

document.addEventListener('click', () => test());
```

### Reactive example

```typescript
function test(): Observable<unknown> {
    return connectHub(navigator.bluetooth).pipe(
        audit((hub) => hub.ports.onIoAttach({
            ports: [ 0 ],
            ioTypes: [ IOType.largeTechnicMotor ]
        })),
        switchMap((hub) => concat(
            hub.motors.setSpeed(0, 100),
            timer(1000),
            hub.motors.setSpeed(0, 0),
            hub.disconnect()
        )),
    );
}

fromEvent(document, 'click').pipe(
    exhaustMap(() => test())
).subscribe();
```
