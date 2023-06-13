/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';

import { bufferCount, concatWith } from 'rxjs';

import { connectHub } from '../register';
import { MessageLoggingMiddleware } from '../middleware';
import { IHub, PortCommandExecutionStatus } from '../hub';
import { AttachIoEvent, HubType, LogLevel } from '../constants';
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
    const hubDisconnectHandle = (): unknown => nextHub.disconnect().subscribe(() => console.log('disconnect command sent'));

    const switchOffHandle = (): unknown => nextHub.switchOff().subscribe(() => console.log('switch off command sent'));

    nextHub.willDisconnect.subscribe(() => {
        console.log('willDisconnect emitted');
    });

    nextHub.willSwitchOff.subscribe(() => {
        console.log('willSwitchOff emitted');
    });

    nextHub.disconnected.subscribe(() => {
        console.log('disconnected emitted');
    });

    nextHub.genericErrors.subscribe((e) => {
        console.log('got generic error', e);
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

    document.getElementById('disconnect')!.addEventListener('click', hubDisconnectHandle);
    document.getElementById('switch-off')!.addEventListener('click', switchOffHandle);
    document.getElementById('increment-angle')!.addEventListener('click', incrementAngle);
    document.getElementById('decrement-angle')!.addEventListener('click', decrementAngle);
    document.getElementById('go-to-zero')!.addEventListener('click', goToZero);
    document.getElementById('set-as-zero')!.addEventListener('click', setAsZero);
    document.getElementById('read-pos')!.addEventListener('click', readPOS);
    document.getElementById('read-apos')!.addEventListener('click', readAPOS);
    document.getElementById('reset-zero')!.addEventListener('click', resetZero);
    document.getElementById('read-pos-apos')!.addEventListener('click', readPOSandAPOS);
    document.getElementById('read-port-value')!.addEventListener('click', readPortValueRaw);
    document.getElementById('read-port-value')!.addEventListener('click', readPortValueRaw);
    document.getElementById('createVirtualPort')!.addEventListener('click', createVirtualPort);
    document.getElementById('deleteVirtualPort')!.addEventListener('click', deleteVirtualPort);
    document.getElementById('virtualPortSetSpeed')!.addEventListener('click', setVirtualPortSpeed);
    document.getElementById('virtualPortSetAngle')!.addEventListener('click', setVirtualPortAngle);

    nextHub.disconnected.subscribe(() => {
        document.getElementById('disconnect')!.removeEventListener('click', hubDisconnectHandle);
        document.getElementById('switch-off')!.removeEventListener('click', switchOffHandle);
        document.getElementById('increment-angle')!.removeEventListener('click', incrementAngle);
        document.getElementById('decrement-angle')!.removeEventListener('click', decrementAngle);
        document.getElementById('go-to-zero')!.removeEventListener('click', goToZero);
        document.getElementById('set-as-zero')!.removeEventListener('click', setAsZero);
        document.getElementById('read-pos')!.removeEventListener('click', readPOS);
        document.getElementById('read-apos')!.removeEventListener('click', readAPOS);
        document.getElementById('reset-zero')!.removeEventListener('click', resetZero);
        document.getElementById('read-pos-apos')!.removeEventListener('click', readPOSandAPOS);
        document.getElementById('read-port-value')!.removeEventListener('click', readPortValueRaw);
        document.getElementById('createVirtualPort')!.removeEventListener('click', createVirtualPort);
        document.getElementById('deleteVirtualPort')!.removeEventListener('click', deleteVirtualPort);
        document.getElementById('virtualPortSetSpeed')!.removeEventListener('click', setVirtualPortSpeed);
        document.getElementById('virtualPortSetAngle')!.removeEventListener('click', setVirtualPortAngle);
        onDisconnected();
    });
}

const angleStep = 10;
let currentAngle = 0;

function getPort(): number {
    return (document.getElementById('port') as HTMLInputElement).valueAsNumber;
}

function incrementAngle(): void {
    currentAngle += angleStep;
    const targetAngle = currentAngle;
    console.log('incrementing angle to', targetAngle);
    hub?.motors.goToPosition(
        getPort(),
        targetAngle
    ).subscribe({
        next: (r) => {
            console.log('settings angle', targetAngle, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('incrementing angle complete', targetAngle);
        }
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
    hub?.ports.createVirtualPort(portIdA, portIdB).subscribe((v) => {
        console.log('createVirtualPort', v);
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

function decrementAngle(): void {
    currentAngle -= angleStep;
    const targetAngle = currentAngle;
    console.log('decrementing angle to', targetAngle);
    hub?.motors.goToPosition(
        getPort(),
        targetAngle
    ).subscribe({
        next: (r) => {
            console.log('settings angle', targetAngle, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('decrementing angle complete', targetAngle);
        }
    });
}

function goToZero(): void {
    const port = getPort();
    hub?.motors.goToPosition(
        port,
        0
    ).subscribe({
        next: (r) => {
            console.log('settings angle', port, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            currentAngle = 0;
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
            currentAngle = 0;
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

function onDisconnected(): void {
    setControlsState(false);
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

