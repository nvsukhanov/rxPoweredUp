import { Observable, ReplaySubject, catchError, concatWith, from, fromEvent, map, of, share, switchMap, take, takeUntil, tap } from 'rxjs';

import { HUB_CHARACTERISTIC_UUID, HUB_SERVICE_UUID, MessageType } from '../constants';
import { IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { BluetoothDeviceWithGatt, IDisposable, ILogger } from '../types';
import { GenericError, IHub } from './i-hub';
import { IOutboundMessengerFactory } from './i-outbound-messenger-factory';
import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { IMotorsFeatureFactory } from './i-motors-feature-factory';
import { IMotorsFeature } from './i-motors-feature';
import { IPortsFeatureFactory } from './i-ports-feature-factory';
import { IPortsFeature } from './i-ports-feature';
import { IInboundMessageListenerFactory } from './i-inbound-message-listener-factory';
import { IReplyParser } from './i-reply-parser';
import { HubConfig } from './hub-config';

export class Hub implements IHub {
    private readonly gattServerDisconnectEventName = 'gattserverdisconnected';

    private _ports: IPortsFeature | undefined;

    private _motors: IMotorsFeature | undefined;

    private _properties: (IHubPropertiesFeature & IDisposable) | undefined;

    private _isConnected = false;

    private _genericErrors?: Observable<GenericError>;

    private _disconnected$ = new ReplaySubject<void>(1);

    constructor(
        private readonly device: BluetoothDeviceWithGatt,
        private readonly logger: ILogger,
        private readonly config: HubConfig,
        private readonly hubConnectionErrorFactory: IHubConnectionErrorsFactory,
        private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        private readonly propertiesFeatureFactory: IHubPropertiesFeatureFactory,
        private readonly ioFeatureFactory: IPortsFeatureFactory,
        private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
        private readonly commandsFeatureFactory: IMotorsFeatureFactory,
        private readonly replyParser: IReplyParser<MessageType.genericError>,
        private readonly messageListenerFactory: IInboundMessageListenerFactory,
    ) {
    }

    public get genericErrors(): Observable<GenericError> {
        if (!this._genericErrors) {
            throw new Error('Hub not connected');
        }
        return this._genericErrors;
    }

    public get ports(): IPortsFeature {
        if (!this._ports) {
            throw new Error('Hub not connected');
        }
        return this._ports;
    }

    public get motors(): IMotorsFeature {
        if (!this._motors) {
            throw new Error('Hub not connected');
        }
        return this._motors;
    }

    public get properties(): IHubPropertiesFeature {
        if (!this._properties) {
            throw new Error('Hub not connected');
        }
        return this._properties;
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
            tap(() => {
                this.logger.debug('Got primary characteristic');
                fromEvent(this.device, this.gattServerDisconnectEventName).pipe(
                    takeUntil(this._disconnected$)
                ).subscribe(() => {
                    this.handleGattServerDisconnect();
                });
            }),
            switchMap((primaryCharacteristic) => from(this.createFeatures(primaryCharacteristic))),
            tap(() => {
                this._isConnected = true;
                this.logger.debug('Hub connection successful');
            }),
            take(1),
            catchError((e) => {
                this.logger.error('Hub connection failed');
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
        return of(void 0).pipe(
            tap(() => this.logger.debug('Disconnection invoked')),
            concatWith(this.disposeFeatures()),
            tap(() => {
                this.device.gatt.disconnect();
                this.logger.debug('Disconnected');
            })
        );
    }

    private handleGattServerDisconnect(): void {
        if (this._isConnected) {
            this.disposeFeatures();
            this.logger.debug('GATT server disconnected');
            this._isConnected = false;
            this._disconnected$.next();
        }
    }

    private disposeFeatures(): Observable<void> {
        return this._properties?.dispose() ?? of(void 0);
    }

    private async createFeatures(
        primaryCharacteristic: BluetoothRemoteGATTCharacteristic
    ): Promise<void> {
        const dataStream = this.characteristicsDataStreamFactory.create(
            primaryCharacteristic,
            {
                incomingMessageMiddleware: this.config.incomingMessageMiddleware,
            }
        );

        this._genericErrors = this.messageListenerFactory.create(
            dataStream,
            this.replyParser,
            this._disconnected$
        ).pipe(
            map((r) => ({ commandType: r.commandType, code: r.code })),
            share()
        );

        const messenger = this.outboundMessengerFactory.create(
            dataStream,
            this._genericErrors,
            primaryCharacteristic,
            this.config.outgoingMessageMiddleware,
            this._disconnected$,
            this.logger,
            this.config
        );

        this._ports = this.ioFeatureFactory.create(
            dataStream,
            this._disconnected$,
            messenger
        );

        this._properties = this.propertiesFeatureFactory.create(
            dataStream,
            this._disconnected$,
            messenger,
            this.logger
        );

        this._motors = this.commandsFeatureFactory.createCommandsFeature(
            dataStream,
            messenger,
            this._ports
        );

        await primaryCharacteristic.startNotifications();
        this.logger.debug('Started primary characteristic notifications');
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
