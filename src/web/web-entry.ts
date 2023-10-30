/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
// noinspection DuplicatedCode

import 'reflect-metadata';

import { Subscription, bufferCount, concatWith, map, mergeMap, switchMap, takeUntil, zip } from 'rxjs';

import { connectHub } from '../register';
import { MessageLoggingMiddleware } from '../middleware';
import { IHub, PortCommandExecutionStatus } from '../hub';
import { AttachIoEvent, HubType, LogLevel, MotorServoEndState, MotorUseProfile } from '../constants';
import { PrefixedConsoleLogger } from '../logger';

let hub: IHub | undefined;

async function connect(): Promise<void> {
    connectHub(
        navigator.bluetooth,
        {
            incomingMessageMiddleware: [ new MessageLoggingMiddleware(new PrefixedConsoleLogger('<', LogLevel.Debug), 'all') ],
            outgoingMessageMiddleware: [ new MessageLoggingMiddleware(new PrefixedConsoleLogger('>', LogLevel.Debug), 'all') ],
            logLevel: LogLevel.Debug
        }
    ).subscribe((connectedHub) => {
        onConnected(connectedHub);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setControlsState(false);
    document.getElementById('connect')!.addEventListener('click', () => connect());
});

function onConnected(nextHub: IHub): void {
    hub = nextHub;
    setControlsState(true);
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const hubDisconnectHandle = (): unknown => nextHub.disconnect().subscribe(() => console.log('disconnect command sent'));

    const switchOffHandle = (): unknown => nextHub.switchOff().subscribe(() => console.log('switch off command sent'));

    nextHub.willDisconnect.subscribe(() => {
        console.log('willDisconnect emitted');
    });

    nextHub.willSwitchOff.subscribe(() => {
        console.log('willSwitchOff emitted');
    });

    nextHub.properties.getBatteryLevel().subscribe((v) => {
        console.log('batteryLevel', v);
    });

    nextHub.properties.buttonState.subscribe((b) => {
        console.log('buttonState', b);
    });

    nextHub.properties.getSystemTypeId().subscribe((v) => {
        console.log('systemTypeId', HubType[v]);
    });

    nextHub.ports.onIoAttach().subscribe((v) => {
        console.log('onIoAttach', v);
        if (v.event === AttachIoEvent.AttachedVirtual) {
            (document.getElementById('virtualPortControlsId') as HTMLInputElement).value = v.portId.toString();
            (document.getElementById('deleteVirtualPortId') as HTMLInputElement).value = v.portId.toString();
        } else {
            (document.getElementById('setAccelerationTimePortId') as HTMLInputElement).value = v.portId.toString();
            (document.getElementById('setDecelerationTimePortId') as HTMLInputElement).value = v.portId.toString();
        }
    });

    nextHub.ports.onIoDetach().subscribe((v) => {
        console.log('onIoDetach', v);
        if (v.event === AttachIoEvent.Detached) {
            const virtualPortControlsIdValue = (document.getElementById('virtualPortControlsId') as HTMLInputElement).value;
            if (virtualPortControlsIdValue === v.portId.toString()) {
                (document.getElementById('virtualPortControlsId') as HTMLInputElement).value = '';
            }

            const deleteVirtualPortIdValue = (document.getElementById('deleteVirtualPortId') as HTMLInputElement).value;
            if (deleteVirtualPortIdValue === v.portId.toString()) {
                (document.getElementById('deleteVirtualPortId') as HTMLInputElement).value = '';
            }
        }
    });

    zip(
        nextHub.ports.onIoAttach({ ports: [ 0 ] }),
        nextHub.ports.onIoAttach({ ports: [ 1 ] }),
    ).pipe(
        takeUntil(nextHub.disconnected)
    ).subscribe(([ a, b ]) => {
        (document.getElementById('dualPort1') as HTMLInputElement).value = a.portId.toString();
        (document.getElementById('dualPort2') as HTMLInputElement).value = b.portId.toString();
        document.getElementById('dual-increment-angle')!.removeAttribute('disabled');
    });

    document.getElementById('disconnect')!.addEventListener('click', hubDisconnectHandle, { signal: abortSignal });
    document.getElementById('switch-off')!.addEventListener('click', switchOffHandle, { signal: abortSignal });
    document.getElementById('read-system-type-id')!.addEventListener('click', readSystemTypeId, { signal: abortSignal });
    document.getElementById('read-manufacturer-name')!.addEventListener('click', readManufacturerName, { signal: abortSignal });
    document.getElementById('increment-angle')!.addEventListener('click', incrementAngle, { signal: abortSignal });
    document.getElementById('decrement-angle')!.addEventListener('click', decrementAngle, { signal: abortSignal });
    document.getElementById('go-to-zero')!.addEventListener('click', goToZero, { signal: abortSignal });
    document.getElementById('set-as-zero')!.addEventListener('click', setAsZero, { signal: abortSignal });
    document.getElementById('read-pos')!.addEventListener('click', readPOS, { signal: abortSignal });
    document.getElementById('read-apos')!.addEventListener('click', readAPOS, { signal: abortSignal });
    document.getElementById('reset-zero')!.addEventListener('click', resetZero, { signal: abortSignal });
    document.getElementById('read-pos-apos')!.addEventListener('click', readPOSandAPOS, { signal: abortSignal });
    document.getElementById('read-port-value')!.addEventListener('click', readPortValueRaw, { signal: abortSignal });
    document.getElementById('read-port-value')!.addEventListener('click', readPortValueRaw, { signal: abortSignal });
    document.getElementById('createVirtualPort')!.addEventListener('click', createVirtualPort, { signal: abortSignal });
    document.getElementById('deleteVirtualPort')!.addEventListener('click', deleteVirtualPort, { signal: abortSignal });
    document.getElementById('virtualPortSetSpeed')!.addEventListener('click', setVirtualPortSpeed, { signal: abortSignal });
    document.getElementById('virtualPortSetAngle')!.addEventListener('click', setVirtualPortAngle, { signal: abortSignal });
    document.getElementById('setPortSpeed')!.addEventListener('click', setPortSpeed, { signal: abortSignal });
    document.getElementById('setPortPosition')!.addEventListener('click', setPortPosition, { signal: abortSignal });
    document.getElementById('rotateByDegree')!.addEventListener('click', rotateByDegree, { signal: abortSignal });
    document.getElementById('runSeqOps')!.addEventListener('click', runSequentialOperations, { signal: abortSignal });
    document.getElementById('dual-increment-angle')!.addEventListener('click', dualIncrementAngle, { signal: abortSignal });
    document.getElementById('setAccelerationTimeButton')!.addEventListener('click', setAccelerationTime, { signal: abortSignal });
    document.getElementById('setDecelerationTimeButton')!.addEventListener('click', setDecelerationTime, { signal: abortSignal });
    document.getElementById('subscribe-port-value')!.addEventListener('click', subscribeToPortValue, { signal: abortSignal });
    document.getElementById('unsubscribe-port-value')!.addEventListener('click', unsubscribeFromPortValue, { signal: abortSignal });
    document.getElementById('voltageRead')!.addEventListener('click', readVoltage, { signal: abortSignal });
    document.getElementById('voltageSubscribe')!.addEventListener('click', subscribeToVoltage, { signal: abortSignal });
    document.getElementById('voltageUnsubscribe')!.addEventListener('click', unsubscribeFromVoltage, { signal: abortSignal });
    document.getElementById('tiltRead')!.addEventListener('click', readTilt, { signal: abortSignal });
    document.getElementById('tiltSubscribe')!.addEventListener('click', subscribeToTiltChanges, { signal: abortSignal });
    document.getElementById('tiltUnsubscribe')!.addEventListener('click', unsubscribeFromTiltChanges, { signal: abortSignal });
    document.getElementById('temperatureRead')!.addEventListener('click', readTemperature, { signal: abortSignal });
    document.getElementById('temperatureSubscribe')!.addEventListener('click', subscribeToTemperatureChanges, { signal: abortSignal });
    document.getElementById('temperatureUnsubscribe')!.addEventListener('click', unsubscribeFromTemperatureChanges, { signal: abortSignal });

    nextHub.disconnected.subscribe(() => {
        console.log('disconnected emitted');
        abortController.abort();
        setControlsState(false);
        hub = undefined;
    });
}

function getPort(): number {
    return (document.getElementById('port') as HTMLInputElement).valueAsNumber;
}

function getAccDecProfile(): MotorUseProfile {
    const useAccProfile = (document.getElementById('useAccelerationProfile') as HTMLInputElement).checked;
    const useDecProfile = (document.getElementById('useDecelerationProfile') as HTMLInputElement).checked;
    if (useAccProfile && useDecProfile) {
        return MotorUseProfile.useAccelerationAndDecelerationProfiles;
    }
    if (useAccProfile) {
        return MotorUseProfile.useAccelerationProfile;
    }
    if (useDecProfile) {
        return MotorUseProfile.useDecelerationProfile;
    }
    return MotorUseProfile.dontUseProfiles;
}

function dualIncrementAngle(): void {
    const port1 = +(document.getElementById('dualPort1') as HTMLInputElement).value;
    const port2 = +(document.getElementById('dualPort2') as HTMLInputElement).value;
    if (!hub) {
        return;
    }
    hub.motors.rotateByDegree(port1, 90, { speed: 50 }).subscribe({
        next: (status) => console.log(`Port 1: ${PortCommandExecutionStatus[status]}`),
        complete: () => console.log('Port 1: complete'),
    });
    hub.motors.rotateByDegree(port2, 90, { speed: 50 }).subscribe({
        next: (status) => console.log(`Port 2: ${PortCommandExecutionStatus[status]}`),
        complete: () => console.log('Port 2: complete'),
    });
}

function readPortValueRaw(): void {
    const portId = (document.getElementById('portValuePort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('portValueMode') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    hub?.ports.getRawPortValue(portId, modeId).subscribe((v) => {
        (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = JSON.stringify(v);
    });
}

function createVirtualPort(): void {
    const portIdA = (document.getElementById('combinePortA') as HTMLInputElement).valueAsNumber;
    const portIdB = (document.getElementById('combinePortB') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portIdA) || !Number.isInteger(portIdB)) {
        return;
    }
    hub?.ports.createVirtualPort(portIdA, portIdB).subscribe({
        next: (v) => {
            console.log('createVirtualPort', v);
        },
        error: (e) => {
            console.log('createVirtualPort error', e);
        }
    });
}

function deleteVirtualPort(): void {
    const virtualPortId = (document.getElementById('deleteVirtualPortId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(virtualPortId)) {
        return;
    }
    hub?.ports.deleteVirtualPort(virtualPortId).subscribe((v) => {
        console.log('deleteVirtualPort', v);
    });
}

function incrementAngle(): void {
    hub?.motors.rotateByDegree(
        getPort(),
        45,
        { endState: MotorServoEndState.hold, useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('incrementing angle by 45 degrees', PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('incrementing angle complete');
        }
    });
}

function decrementAngle(): void {
    hub?.motors.rotateByDegree(
        getPort(),
        45,
        { endState: MotorServoEndState.hold, useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('decrementing angle by 45 degrees', PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('decrementing angle complete');
        }
    });
}

function goToZero(): void {
    const port = getPort();
    hub?.motors.goToPosition(
        port,
        0,
        { useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('settings angle', port, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('goToZero complete', port);
        }
    });
}

function setAsZero(): void {
    const port = getPort();
    hub?.motors.setZeroPositionRelativeToCurrentPosition(
        port,
        0
    ).subscribe({
        next: (r) => {
            console.log('setAsZero', port, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('setAsZero complete', port);
        }
    });
}

function readPOS(): void {
    hub?.motors.getPosition(getPort()).subscribe((r) => {
        console.log('readPosition', r);
    });
}

function readAPOS(): void {
    hub?.motors.getAbsolutePosition(getPort()).subscribe((r) => {
        console.log('readAbsolutePosition', r);
    });
}

function readPOSandAPOS(): void {
    const port = getPort();
    if (!hub) {
        return;
    }
    hub.motors.getPosition(port).pipe(
        concatWith(hub.motors.getAbsolutePosition(port)),
        bufferCount(2)
    ).subscribe((v) => console.log('POS and APOS', v));
}

function resetZero(): void {
    hub?.motors.resetEncoder(getPort()).subscribe((r) => {
        console.log('resetZero', r);
    });
}

function setControlsState(isConnected: boolean): void {
    (document.getElementById('connect') as HTMLButtonElement).disabled = isConnected;
    const connectedControls = document.getElementsByClassName('connected-control');
    for (let i = 0; i < connectedControls.length; i++) {
        (connectedControls[i] as HTMLButtonElement).disabled = !isConnected;
    }
}

function setVirtualPortSpeed(): void {
    const virtualPortId = (document.getElementById('virtualPortControlsId') as HTMLInputElement).valueAsNumber;
    const speed1 = (document.getElementById('virtualPortSpeedInput1') as HTMLInputElement).valueAsNumber;
    const speed2 = (document.getElementById('virtualPortSpeedInput2') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(virtualPortId)) {
        return;
    }
    hub?.motors.setSpeedSynchronized(virtualPortId, speed1, speed2).subscribe((v) => {
        console.log('setVirtualPortSpeed', v);
    });
}

function setVirtualPortAngle(): void {
    const virtualPortId = (document.getElementById('virtualPortControlsId') as HTMLInputElement).valueAsNumber;
    const angle1 = (document.getElementById('virtualPortAngleInput1') as HTMLInputElement).valueAsNumber;
    const angle2 = (document.getElementById('virtualPortAngleInput2') as HTMLInputElement).valueAsNumber;
    const speed = (document.getElementById('virtualPortAngleSpeedInput') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(virtualPortId)) {
        return;
    }
    hub?.motors.goToPositionSynchronized(virtualPortId, angle1, angle2, { speed }).subscribe((v) => {
        console.log('setVirtualPortSpeed', v);
    });
}

function setPortSpeed(): void {
    const portId = (document.getElementById('portSpeedCommandPort') as HTMLInputElement).valueAsNumber;
    const speed = (document.getElementById('portSpeedCommandSpeed') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(speed)) {
        return;
    }
    hub?.motors.setSpeed(
        portId,
        speed,
        { useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('setPortSpeed', PortCommandExecutionStatus[r]);
        },
        error: (e) => {
            console.log('setPortSpeed error', e);
        },
        complete: () => {
            console.log('setPortSpeed stream complete');
        }
    });
}

function setPortPosition(): void {
    const portId = (document.getElementById('portPositionCommandPort') as HTMLInputElement).valueAsNumber;
    const angle = (document.getElementById('portPositionCommandAngle') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(angle)) {
        return;
    }
    hub?.motors.goToPosition(
        portId,
        angle,
        { useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('setPortPosition', PortCommandExecutionStatus[r]);
        },
        error: (e) => {
            console.log('setPortPosition error', e);
        },
        complete: () => {
            console.log('setPortPosition stream complete');
        }
    });
}

function rotateByDegree(): void {
    const portId = (document.getElementById('portRotateByDegreeCommandPort') as HTMLInputElement).valueAsNumber;
    const degree = (document.getElementById('portRotateByDegreeCommandDegree') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(degree)) {
        return;
    }
    hub?.motors.rotateByDegree(
        portId,
        degree,
        { useProfile: getAccDecProfile() }
    ).subscribe({
        next: (r) => {
            console.log('rotateByDegree', PortCommandExecutionStatus[r]);
        },
        error: (e) => {
            console.log('rotateByDegree error', e);
        },
        complete: () => {
            console.log('rotateByDegree stream complete');
        }
    });
}

function runSequentialOperations(): void {
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('port') as HTMLInputElement).valueAsNumber;
    const startTime = Date.now();
    const config = { useProfile: getAccDecProfile() };
    hub.motors.setSpeed(portId, 100).pipe(
        map((result) => ({ op: 'speed 100', result })),
        concatWith(
            hub.motors.setSpeed(portId, 90, config).pipe(map((result) => ({ op: 'speed 90', result }))),
            hub.motors.setSpeed(portId, 80, config).pipe(map((result) => ({ op: 'speed 80', result }))),
            hub.motors.setSpeed(portId, 70, config).pipe(map((result) => ({ op: 'speed 70', result }))),
            hub.motors.setSpeed(portId, 60, config).pipe(map((result) => ({ op: 'speed 60', result }))),
            hub.motors.setSpeed(portId, 50, config).pipe(map((result) => ({ op: 'speed 50', result }))),
            hub.motors.goToPosition(portId, 45, config).pipe(map((result) => ({ op: 'angle 45', result }))),
            hub.motors.goToPosition(portId, 90, config).pipe(map((result) => ({ op: 'angle 90', result }))),
            hub.motors.setSpeed(portId, 40, config).pipe(map((result) => ({ op: 'speed 40', result }))),
            hub.motors.setSpeed(portId, 30, config).pipe(map((result) => ({ op: 'speed 30', result }))),
            hub.motors.goToPosition(portId, 180, config).pipe(map((result) => ({ op: 'angle 180', result }))),
            hub.motors.setSpeed(portId, 20, config).pipe(map((result) => ({ op: 'speed 20', result }))),
            hub.motors.setSpeed(portId, 10, config).pipe(map((result) => ({ op: 'speed 10', result }))),
            hub.motors.setSpeed(portId, 0, config).pipe(map((result) => ({ op: 'speed 0', result })))
        )
    ).subscribe({
        next: (v) => {
            console.log(`op ${v.op} - ${PortCommandExecutionStatus[v.result]}`);
        },
        complete: () => {
            console.log('sequential ops executed in', Date.now() - startTime);
        }
    });
}

function setAccelerationTime(): void {
    const portId = (document.getElementById('setAccelerationTimePortId') as HTMLInputElement).valueAsNumber;
    const accelerationTimeMs = (document.getElementById('setAccelerationTimeMs') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(accelerationTimeMs)) {
        return;
    }
    hub?.motors.setAccelerationTime(portId, accelerationTimeMs).subscribe({
        next: (r) => {
            console.log('setAccelerationTime', PortCommandExecutionStatus[r]);
        },
        error: (e) => {
            console.log('setAccelerationTime error', e);
        },
        complete: () => {
            console.log('setAccelerationTime stream complete');
        }
    });
}

function setDecelerationTime(): void {
    const portId = (document.getElementById('setDecelerationTimePortId') as HTMLInputElement).valueAsNumber;
    const decelerationTimeMs = (document.getElementById('setDecelerationTimeMs') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(decelerationTimeMs)) {
        return;
    }
    hub?.motors.setDecelerationTime(portId, decelerationTimeMs).subscribe({
        next: (r) => {
            console.log('setDecelerationTime', PortCommandExecutionStatus[r]);
        },
        error: (e) => {
            console.log('setDecelerationTime error', e);
        },
        complete: () => {
            console.log('setDecelerationTime stream complete');
        }
    });
}

let portValueSubscription: Subscription | undefined;

function subscribeToPortValue(): void {
    portValueSubscription?.unsubscribe();
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('portValuePort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('portValueMode') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    portValueSubscription = hub.ports.rawPortValueChanges(portId, modeId, 1).subscribe({
        next: (v) => (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = 'complete',
    });
}

function unsubscribeFromPortValue(): void {
    portValueSubscription?.unsubscribe();
    (document.getElementById('portValueResults') as HTMLPreElement).innerHTML = 'unsubscribed';
}

let voltageValueSubscription: Subscription | undefined;

function readVoltage(): void {
    voltageValueSubscription?.unsubscribe();
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('voltageReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('voltageReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('voltageResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    const h = hub;
    voltageValueSubscription = h.properties.getSystemTypeId().pipe(
        mergeMap((systemTypeId) => h.sensors.getVoltage(portId, modeId, systemTypeId))
    ).subscribe({
        next: (v) => (document.getElementById('voltageResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('voltage receive data complete'),
    });
}

let voltageChangeSubscription: Subscription | undefined;

function subscribeToVoltage(): void {
    voltageChangeSubscription?.unsubscribe();
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('voltageReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('voltageReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('voltageResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    const h = hub;
    voltageChangeSubscription = h.properties.getSystemTypeId().pipe(
        switchMap((systemTypeId) => h.sensors.getVoltage(portId, modeId, systemTypeId).pipe(
            concatWith(h.sensors.voltageChanges(portId, modeId, 1, systemTypeId))
        ))
    ).subscribe({
        next: (v) => (document.getElementById('voltageResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('voltage changes unsubscribed'),
    });
}

function readTilt(): void {
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('tiltReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('tiltReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('tiltResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    hub.sensors.getTilt(portId, modeId).subscribe({
        next: (v) => (document.getElementById('tiltResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('tilt receive data complete'),
    });
}

let tiltChangeSubscription: Subscription | undefined;

function subscribeToTiltChanges(): void {
    tiltChangeSubscription?.unsubscribe();
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('tiltReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('tiltReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('tiltResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    tiltChangeSubscription = hub.sensors.tiltChanges(portId, modeId, 5).subscribe({
        next: (v) => (document.getElementById('tiltResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('tilt changes unsubscribed'),
    });
}

function readTemperature(): void {
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('temperatureReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('temperatureReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('temperatureResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    hub.sensors.getTemperature(portId, modeId).subscribe({
        next: (v) => (document.getElementById('temperatureResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('temperature receive data complete'),
    });
}

let temperatureChangeSubscription: Subscription | undefined;

function subscribeToTemperatureChanges(): void {
    console.log('q');
    temperatureChangeSubscription?.unsubscribe();
    if (!hub) {
        return;
    }
    const portId = (document.getElementById('temperatureReadPort') as HTMLInputElement).valueAsNumber;
    const modeId = (document.getElementById('temperatureReadPortModeId') as HTMLInputElement).valueAsNumber;
    if (!Number.isInteger(portId) || !Number.isInteger(modeId)) {
        (document.getElementById('temperatureResults') as HTMLPreElement).innerHTML = 'input error';
        return;
    }
    temperatureChangeSubscription = hub.sensors.temperatureChanges(portId, modeId, 10).subscribe({
        next: (v) => (document.getElementById('temperatureResults') as HTMLPreElement).innerHTML = JSON.stringify(v),
        complete: () => console.log('temperature changes unsubscribed'),
    });
}

function unsubscribeFromTiltChanges(): void {
    tiltChangeSubscription?.unsubscribe();
    (document.getElementById('tiltResults') as HTMLPreElement).innerHTML = 'unsubscribed';
}

function unsubscribeFromVoltage(): void {
    voltageChangeSubscription?.unsubscribe();
    (document.getElementById('voltageResults') as HTMLPreElement).innerHTML = 'unsubscribed';
}

function unsubscribeFromTemperatureChanges(): void {
    temperatureChangeSubscription?.unsubscribe();
    (document.getElementById('temperatureResults') as HTMLPreElement).innerHTML = 'unsubscribed';
}

function readSystemTypeId(): void {
    hub?.properties.getSystemTypeId().subscribe((v) => {
        console.log('raw systemTypeId', v);
        console.log('systemTypeId', HubType[v]);
    });
}

function readManufacturerName(): void {
    hub?.properties.getManufacturerName().subscribe((v) => {
        console.log('manufacturerName', v);
    });
}
