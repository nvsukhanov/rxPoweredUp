/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';

import { filter, interval, take } from 'rxjs';

import { connectHub } from '../register';
import { LoggingMiddleware } from '../middleware';
import { IHub } from '../hub';
import { WebLogger } from './web-logger';
import { AttachIoEvent, MotorProfile, MotorServoEndState } from '../constants';
import { PortCommandExecutionStatus } from '../features';

let hub: IHub | undefined;

async function connect(): Promise<void> {
    const hub = await connectHub(
        navigator.bluetooth,
        [ new LoggingMiddleware(new WebLogger('<'), 'all') ],
        [ new LoggingMiddleware(new WebLogger('>'), 'all') ]
    );
    onConnected(hub);
}

document.addEventListener('DOMContentLoaded', () => {
    setControlsState(false);
    document.getElementById('connect')!.addEventListener('click', () => connect());
});

function onConnected(nextHub: IHub): void {
    hub = nextHub;
    setControlsState(true);
    const hubDisconnectHandle = (): unknown => nextHub.disconnect();

    nextHub.ports.attachedIoReplies$.pipe(
        filter((r) => r.event === AttachIoEvent.Attached && (r.portId === 0 || r.portId === 1)),
    ).subscribe((r) => {
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

    nextHub.disconnected$.subscribe(() => {
        document.getElementById('disconnect')!.removeEventListener('click', hubDisconnectHandle);
        document.getElementById('increment-angle')!.removeEventListener('click', incrementAngle);
        document.getElementById('sequential-increment-angle')!.removeEventListener('click', sequentialIncrementAngle);
        onDisconnected();
    });
}

const angleStep = 90;
let currentAngle = 0;

function incrementAngle(): void {
    currentAngle += angleStep;
    const targetAngle = currentAngle;
    hub?.commands.goToAbsoluteDegree(0, targetAngle, 100, 100, MotorServoEndState.hold, MotorProfile.useAccelerationAndDecelerationProfiles)
       .subscribe({
           next: (r) => {
               console.log('settings angle', targetAngle, PortCommandExecutionStatus[r]);
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
