# rxPoweredUp

[![GitHub license](https://img.shields.io/github/license/nvsukhanov/rxpoweredup)](https://github.com/nvsukhanov/rxpoweredup/blob/main/LICENSE)
[![CI Status](https://github.com/nvsukhanov/rxpoweredup/actions/workflows/ci.yml/badge.svg)](https://github.com/nvsukhanov/rxpoweredup/actions)
[![NPM Version](https://img.shields.io/npm/v/rxpoweredup.svg?style=flat)](https://www.npmjs.com/package/rxpoweredup)

A light-weight Typescript RxJS-based library for controlling LEGO Powered UP hubs & peripherals using Web Bluetooth API.

Documentation can be found [here](https://nvsukhanov.github.io/rxPoweredUp)

## Disclaimer

LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this application.

## Examples

Following examples use experimental navigator.bluetooth browser API to connect to Bluetooth devices, which is not yet
fully supported by all browsers.
Web Bluetooth API is not available in Node.js, however, it may be possible to use libraries which provide similar API.

### Reactive

```typescript
connectHub(navigator.bluetooth).pipe( // connect to the first available hub
    audit((hub) => hub.ports.onIoAttach(0)), // wait for the first device to be attached to port 0
    switchMap((hub) => concat(
        hub.motors.setSpeed(0, 100), // set motor speed to 100
        timer(1000), // wait for 1 second
        hub.motors.setSpeed(0, 0), // stop motor
        hub.disconnect() // disconnect from the hub
    ))
).subscribe();
```

### Async

```typescript
const hub = await firstValueFrom(connectHub(navigator.bluetooth));
await firstValueFrom(hub.ports.onIoAttach(0));
await lastValueFrom(hub.motors.setSpeed(0, 100));
await lastValueFrom(timer(1000));
await lastValueFrom(hub.motors.setSpeed(0, 0));
await lastValueFrom(hub.disconnect());
```

More examples can be found [here](https://github.com/nvsukhanov/rxPoweredUp/tree/main/apps/examples)
