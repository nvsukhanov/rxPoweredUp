/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';

import { interval, take } from 'rxjs';

import { connectHub } from '../register';
import { LoggingMiddleware } from '../middleware';
import { IHub, PortCommandExecutionStatus } from '../hub';
import { WebLogger } from './web-logger';

let hub: IHub | undefined;

async function connect(): Promise<void> {
    connectHub(
        navigator.bluetooth,
        [ new LoggingMiddleware(new WebLogger('<'), 'all') ],
        [ new LoggingMiddleware(new WebLogger('>'), 'all') ]
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

    nextHub.ports.onIoAttach(0).subscribe((r) => {
        nextHub.commands.setAccelerationTime(r.portId, 200).subscribe((t) => {
            console.log('setAccelerationTime', r.portId, PortCommandExecutionStatus[t]);
        });
        nextHub.commands.setDecelerationTime(r.portId, 200).subscribe((t) => {
            console.log('setDecelerationTime', r.portId, PortCommandExecutionStatus[t]);
        });
        nextHub.commands.setAbsoluteZeroRelativeToCurrentPosition(r.portId, 0).subscribe((t) => {
            console.log('setAbsoluteZeroRelativeToCurrentPosition', r.portId, PortCommandExecutionStatus[t]);
        });
    });

    document.getElementById('disconnect')!.addEventListener('click', hubDisconnectHandle);
    document.getElementById('increment-angle')!.addEventListener('click', incrementAngle);
    document.getElementById('sequential-increment-angle')!.addEventListener('click', sequentialIncrementAngle);

    nextHub.disconnected.subscribe(() => {
        document.getElementById('disconnect')!.removeEventListener('click', hubDisconnectHandle);
        document.getElementById('increment-angle')!.removeEventListener('click', incrementAngle);
        document.getElementById('sequential-increment-angle')!.removeEventListener('click', sequentialIncrementAngle);
        onDisconnected();
    });
}

const angleStep = 90;
let currentAngle = 0;

function incrementAngle(): void {
    console.log('in', hub?.commands);
    currentAngle += angleStep;
    const targetAngle = currentAngle;
    console.log('starting settings angle', targetAngle);
    hub?.commands.goToAbsoluteDegree(
        0,
        targetAngle
    ).subscribe({
        next: (r) => {
            console.log('settings angle', targetAngle, PortCommandExecutionStatus[r]);
        },
        complete: () => {
            console.log('settings angle complete', targetAngle);
        }
    });
}

function sequentialIncrementAngle(): void {
    interval(1000 / 20).pipe(
        take(10)
    ).subscribe(() => incrementAngle());
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
