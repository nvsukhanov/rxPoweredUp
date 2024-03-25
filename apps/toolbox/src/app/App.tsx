import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { IHub, LogLevel, PortOperationStartupInformation, connectHub } from 'rxpoweredup';

import styles from './App.module.scss';
import { Nav } from '../nav';
import { BluetoothAvailability, HubConnectionState, NAVIGATOR, WINDOW } from '../types';
import { RouterOutlet } from './Router-outlet';
import { BluetoothUnavailableNotification } from '../common';
import { MessageDirection, useHubStore } from '../store';
import { StoreMessageMiddleware } from './store-message-middleware';
import { useInject } from '../di';
import { StoreLogger } from './store-logger.ts';
import { Footer } from './footer';

export function App(): ReactElement {
    const window = useInject(WINDOW);
    const navigator = useInject(NAVIGATOR);
    const [ hub, setHub ] = useState<IHub | undefined>(undefined);
    const isBluetoothAvailable = useHubStore((state) => state.isBluetoothAvailable);
    const setBluetoothAvailability = useHubStore((state) => state.setBluetoothAvailability);
    const hubConnection = useHubStore((state) => state.hubConnection);
    const setHubConnectionState = useHubStore((state) => state.setHubConnection);
    const onHubDisconnect = useHubStore((state) => state.onHubDisconnect);

    const addMessageLogEntry = useHubStore((state) => state.addMessagesLogEntry);
    const addConsoleLogEntry = useHubStore((state) => state.addConsoleLogEntry);

    const inboundLoggingMiddleware = useRef(new StoreMessageMiddleware(addMessageLogEntry, MessageDirection.Inbound, window));
    const outboundLoggingMiddleware = useRef(new StoreMessageMiddleware(addMessageLogEntry, MessageDirection.Outbound, window));
    const storeLogger = useRef(new StoreLogger(addConsoleLogEntry, window));

    window.onerror = (message): void => {
        storeLogger.current.error(message);
    };

    useEffect(() => {
        if (!isBluetoothAvailable) {
            if (navigator.bluetooth === undefined) {
                setBluetoothAvailability(false);
            } else {
                navigator.bluetooth.getAvailability().then((isAvailable) => {
                    setBluetoothAvailability(isAvailable);
                });
            }
        }
    }, [ isBluetoothAvailable, setBluetoothAvailability, navigator.bluetooth ]);

    useEffect(() => {
        if (hub) {
            hub.disconnected.subscribe(() => {
                onHubDisconnect();
                setHub(undefined);
            });
        }
    }, [ hub, setHub, onHubDisconnect ]);

    const connect = useCallback((useLinuxWorkaround: boolean) => {
        if (hubConnection !== HubConnectionState.Disconnected) {
            throw new Error('Cannot connect when already connected or connecting.');
        }
        setHub(undefined);
        setHubConnectionState(HubConnectionState.Connecting);
        connectHub(
            navigator.bluetooth,
            {
                incomingMessageMiddleware: [ inboundLoggingMiddleware.current ],
                outgoingMessageMiddleware: [ outboundLoggingMiddleware.current ],
                logLevel: LogLevel.Debug,
                logger: storeLogger.current,
                defaultBufferMode: PortOperationStartupInformation.executeImmediately,
                useLinuxWorkaround
            }
        ).subscribe({
            next: (connectedHub) => {
                setHub(connectedHub);
                setHubConnectionState(HubConnectionState.Connected);
            },
            error: (e) => {
                setHubConnectionState(HubConnectionState.Disconnected);
                console.error('Unable to connect to hub', e);
            },
        });
    }, [ hubConnection, setHubConnectionState, setHub, navigator.bluetooth ]);

    const disconnect = useCallback(() => {
        if (hubConnection !== HubConnectionState.Connected) {
            throw new Error('Cannot disconnect when not connected.');
        }
        setHubConnectionState(HubConnectionState.Disconnecting);
        hub?.disconnect().subscribe();
    }, [ hubConnection, setHubConnectionState, hub ]);

    switch (isBluetoothAvailable) {
        case BluetoothAvailability.Unknown:
            return (
                <main className={styles['main']}>
                    Checking Bluetooth availability...
                </main>
            );
        case BluetoothAvailability.Available:
            return (
                <>
                    <header>
                        <Nav connectionState={hubConnection}
                             onConnect={(useLinuxWorkaround: boolean): void => connect(useLinuxWorkaround)}
                             onDisconnect={(): void => disconnect()}
                        />
                    </header>
                    <main className={styles['main']}>
                        <RouterOutlet hub={hub}/>
                    </main>
                    {
                        <footer className={styles['messagesFooter']}>
                            <Footer/>
                        </footer>
                    }
                </>
            );
        case BluetoothAvailability.Unavailable:
            return (
                <main className={styles['main']}>
                    <BluetoothUnavailableNotification/>
                </main>
            );
    }
}
