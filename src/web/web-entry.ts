/* eslint-disable no-console,@typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';

import { connectHub } from '../register';
import { LoggingMiddleware } from '../middleware';
import { Hub } from '../hub';

async function connect(): Promise<void> {
    const hub = await connectHub(
        navigator.bluetooth,
        [ new LoggingMiddleware(console, 'all') ],
        [ new LoggingMiddleware(console, 'all') ]
    );
    onConnected(hub);
}

document.addEventListener('DOMContentLoaded', () => {
    setControlsState(false);
    document.getElementById('connect')!.addEventListener('click', () => connect());
});

function onConnected(hub: Hub): void {
    setControlsState(true);
    const hubDisconnectHandle = (): unknown => hub.disconnect();
    document.getElementById('disconnect')!.addEventListener('click', hubDisconnectHandle);
    hub.disconnected$.subscribe(() => {
        document.getElementById('disconnect')!.removeEventListener('click', hubDisconnectHandle);
        onDisconnected();
    });
}

function onDisconnected(): void {
    setControlsState(false);
}

function setControlsState(isConnected: boolean): void {
    (document.getElementById('connect') as HTMLButtonElement).disabled = isConnected;
    (document.getElementById('disconnect') as HTMLButtonElement).disabled = !isConnected;
}
