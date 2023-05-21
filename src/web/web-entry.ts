/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';

import { connectHub } from '../register';
import { MessageLoggingMiddleware } from '../middleware';
import { IHub, PortCommandExecutionStatus } from '../hub';
import { HubType, LogLevel } from '../constants';
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
    ).subscribe((hub) => {
        onConnected(hub);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setControlsState(false);
    document.getElementById('connect')!.addEventListener('click', () => connect());
});

function onConnected(nextHub: IHub): void {
    hub = nextHub;
    setControlsState(true);
    const hubDisconnectHandle = (): unknown => nextHub.disconnect().subscribe(() => console.log('disconnected'));

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

    document.getElementById('disconnect')!.addEventListener('click', hubDisconnectHandle);
    document.getElementById('increment-angle')!.addEventListener('click', incrementAngle);
    document.getElementById('decrement-angle')!.addEventListener('click', decrementAngle);
    document.getElementById('go-to-zero')!.addEventListener('click', goToZero);
    document.getElementById('set-as-zero')!.addEventListener('click', setAsZero);
    document.getElementById('read-pos')!.addEventListener('click', readPOS);
    document.getElementById('read-apos')!.addEventListener('click', readAPOS);
    document.getElementById('reset-zero')!.addEventListener('click', resetZero);

    nextHub.disconnected.subscribe(() => {
        document.getElementById('disconnect')!.removeEventListener('click', hubDisconnectHandle);
        document.getElementById('increment-angle')!.removeEventListener('click', incrementAngle);
        document.getElementById('decrement-angle')!.removeEventListener('click', decrementAngle);
        document.getElementById('go-to-zero')!.removeEventListener('click', goToZero);
        document.getElementById('set-as-zero')!.removeEventListener('click', setAsZero);
        document.getElementById('read-pos')!.removeEventListener('click', readPOS);
        document.getElementById('read-apos')!.removeEventListener('click', readAPOS);
        document.getElementById('reset-zero')!.removeEventListener('click', resetZero);
        onDisconnected();
    });
}

const angleStep = 10;
let currentAngle = 0;

function incrementAngle(): void {
    currentAngle += angleStep;
    const targetAngle = currentAngle;
    console.log('incrementing angle to', targetAngle);
    hub?.motors.goToPosition(
        0,
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

function decrementAngle(): void {
    currentAngle -= angleStep;
    const targetAngle = currentAngle;
    console.log('decrementing angle to', targetAngle);
    hub?.motors.goToPosition(
        0,
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
    hub?.motors.goToPosition(
        0,
        0
    ).subscribe({
        next: (r) => {
            console.log('settings angle', 0, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            currentAngle = 0;
            console.log('goToZero complete', 0);
        }
    });
}

function setAsZero(): void {
    hub?.motors.setZeroPositionRelativeToCurrentPosition(
        0,
        0
    ).subscribe({
        next: (r) => {
            console.log('setAsZero', 0, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            currentAngle = 0;
            console.log('setAsZero complete', 0);
        }
    });
}

function readPOS(): void {
    hub?.motors.getPosition(0).subscribe((r) => {
        console.log('readPosition', r);
    });
}

function readAPOS(): void {
    hub?.motors.getAbsolutePosition(0).subscribe((r) => {
        console.log('readAbsolutePosition', r);
    });
}

function resetZero(): void {
    hub?.motors.resetEncoder(0).subscribe((r) => {
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
