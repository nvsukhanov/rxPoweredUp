import { NEVER, Observable, Subject, catchError, from, fromEvent, map, of, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs';

import { IMessageMiddleware } from './i-message-middleware';
import { HUB_CHARACTERISTIC_UUID, HUB_SERVICE_UUID } from '../constants';
import { IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { BluetoothDeviceWithGatt, IDisposable, ILegoHubConfig, ILogger } from '../types';
import { IHub } from './i-hub';
import { IOutboundMessengerFactory } from './i-outbound-messenger-factory';
import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { IPortOutputCommandsFeatureFactory } from './i-port-output-commands-feature-factory';
import { IPortOutputCommandsFeature } from './i-port-output-commands-feature';
import { IPortsFeatureFactory } from './i-ports-feature-factory';
import { IPortsFeature } from './i-ports-feature';

export class Hub implements IHub {
    private readonly gattServerDisconnectEventName = 'gattserverdisconnected';

    private _ports: IPortsFeature | undefined;

    private _motor: IPortOutputCommandsFeature | undefined;

    private _properties: (IHubPropertiesFeature & IDisposable) | undefined;

    private _isConnected = false;

    private _beforeDisconnect = new Subject<void>();

    private _primaryCharacteristic?: BluetoothRemoteGATTCharacteristic;

    private _disconnected$?: Observable<void>;

    constructor(
        private readonly device: BluetoothDeviceWithGatt,
        private readonly logger: ILogger,
        private readonly config: ILegoHubConfig,
        private readonly hubConnectionErrorFactory: IHubConnectionErrorsFactory,
        private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        private readonly propertiesFeatureFactory: IHubPropertiesFeatureFactory,
        private readonly ioFeatureFactory: IPortsFeatureFactory,
        private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
        private readonly commandsFeatureFactory: IPortOutputCommandsFeatureFactory,
        private readonly incomingMessageMiddleware: IMessageMiddleware[] = [],
        private readonly outgoingMessageMiddleware: IMessageMiddleware[] = [],
        private readonly externalDisconnectEvents$: Observable<unknown> = NEVER
    ) {
    }

    public get ports(): IPortsFeature {
        if (!this._ports) {
            throw new Error('Hub not connected');
        }
        return this._ports;
    }

    public get commands(): IPortOutputCommandsFeature {
        if (!this._motor) {
            throw new Error('Hub not connected');
        }
        return this._motor;
    }

    public get properties(): IHubPropertiesFeature {
        if (!this._properties) {
            throw new Error('Hub not connected');
        }
        return this._properties;
    }

    public get beforeDisconnect(): Observable<void> {
        if (!this._beforeDisconnect) {
            throw new Error('Hub not connected');
        }
        return this._beforeDisconnect;
    }

    public get disconnected(): Observable<void> {
        if (!this._disconnected$) {
            throw new Error('Hub not connected');
        }
        return this._disconnected$;
    }

    public connect(): Observable<void> {
        if (this._isConnected) {
            throw new Error('Hub already connected');
        }
        return of(null).pipe(
            tap(() => this.logger.debug('Connecting to GATT server')),
            switchMap(() => from(this.connectGattServer(this.device))),
            tap(() => this.logger.debug('Connected to GATT server')),
            switchMap((gatt) => from(gatt.getPrimaryService(HUB_SERVICE_UUID))),
            tap(() => this.logger.debug('Got primary service')),
            switchMap((primaryService) => from(primaryService.getCharacteristic(HUB_CHARACTERISTIC_UUID))),
            tap(() => this.logger.debug('Got primary characteristic')),
            switchMap((primaryCharacteristic) => from(this.createFeatures(primaryCharacteristic))),
            tap(() => {
                this._isConnected = true;
                this.logger.debug('Hub connection successful');
            }),
            take(1),
            catchError((e) => {
                this.logger.error('Hub connection failed', e);
                this.device.gatt.disconnect();
                this._isConnected = false;
                throw e;
            })
        ) as Observable<void>;
    }

    public disconnect(): Observable<void> {
        if (!this._isConnected) {
            throw new Error('Hub not connected');
        }
        return of(null).pipe(
            tap(() => this.logger.debug('Disconnection invoked')),
            tap(() => this._beforeDisconnect.next()),
            tap(() => this._beforeDisconnect.complete()),
            switchMap(() => from(this._primaryCharacteristic?.stopNotifications() ?? Promise.resolve())),
            switchMap(() => this._properties?.dispose() ?? of(void 0)),
            tap(() => {
                this.logger.debug('Stopped primary characteristic notifications');
                this.device.gatt.disconnect();
                this.logger.debug('Disconnected');
            })
        );
    }

    private async createFeatures(
        primaryCharacteristic: BluetoothRemoteGATTCharacteristic
    ): Promise<void> {
        this._disconnected$ = fromEvent(this.device, this.gattServerDisconnectEventName).pipe(
            tap(() => this.logger.debug('GATT server disconnected')),
            map(() => void 0),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        const dataStream = this.characteristicsDataStreamFactory.create(primaryCharacteristic, this.incomingMessageMiddleware);

        const messenger = this.outboundMessengerFactory.create(
            dataStream,
            primaryCharacteristic,
            this.outgoingMessageMiddleware,
            this._beforeDisconnect
        );

        this._ports = this.ioFeatureFactory.create(
            dataStream,
            this.beforeDisconnect,
            messenger
        );

        this._properties = this.propertiesFeatureFactory.create(
            dataStream,
            this.beforeDisconnect,
            messenger,
            this.logger
        );

        this._motor = this.commandsFeatureFactory.createCommandsFeature(
            dataStream,
            messenger
        );

        await primaryCharacteristic.startNotifications();
        this.logger.debug('Started primary characteristic notifications');

        const externalDisconnectSubscription = this.externalDisconnectEvents$.pipe(
            takeUntil(this.beforeDisconnect),
            take(1)
        ).subscribe(() => {
            this.logger.debug('External disconnect event received');
            externalDisconnectSubscription.unsubscribe();
            this.disconnect();
        });
    }

    private async connectGattServer(device: BluetoothDeviceWithGatt): Promise<BluetoothRemoteGATTServer> {
        let gatt: BluetoothRemoteGATTServer | null = null;

        for (let i = 0; i < this.config.maxGattConnectRetries && !gatt; i++) {
            gatt = await device.gatt.connect().catch(() => null);
        }
        if (!gatt) {
            throw this.hubConnectionErrorFactory.createGattConnectionError();
        }
        return gatt;
    }
}
