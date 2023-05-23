import { Observable, Subject, catchError, from, fromEvent, map, of, share, shareReplay, switchMap, take, tap } from 'rxjs';

import { HUB_CHARACTERISTIC_UUID, HUB_SERVICE_UUID, MessageType } from '../constants';
import { IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { BluetoothDeviceWithGatt, IDisposable, ILogger } from '../types';
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
import { GenericError } from './generic-error';

export class Hub {
    private readonly gattServerDisconnectEventName = 'gattserverdisconnected';

    private _ports: IPortsFeature | undefined;

    private _motors: IMotorsFeature | undefined;

    private _properties: (IHubPropertiesFeature & IDisposable) | undefined;

    private _isConnected = false;

    private _beforeDisconnect = new Subject<void>();

    private _primaryCharacteristic?: BluetoothRemoteGATTCharacteristic;

    private _genericErrors?: Observable<GenericError>;

    private _disconnected$?: Observable<void>;

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

    /**
     * Emits when a generic error is received from the hub.
     * Generic errors are errors that are not specific to a feature.
     * e.g when a port output command for a port without an attached it is sent to the hub, the stream will emit:
     * { commandType: MessageType.portOutputCommandFeedback, code: GenericErrorCode.invalidUse }
     */
    public get genericErrors(): Observable<GenericError> {
        if (!this._genericErrors) {
            throw new Error('Hub not connected');
        }
        return this._genericErrors;
    }

    /**
     * Provides a way to access the ports information of the hub.
     * e.g. listen to port attach/detach events, request port value, etc.
     * Hub identifies ports by their numerical index (not by their literal name engraved on the hub).
     * e.g. port A is index 0, port B is index 1, etc.
     * Also note that hubs usually have internal ports that can be accessed by their index as well (eg. 50).
     * On hub connection, the hub will emit a port attach event for each port that has a device attached to it, including internal ports.
     */
    public get ports(): IPortsFeature {
        if (!this._ports) {
            throw new Error('Hub not connected');
        }
        return this._ports;
    }

    /**
     * Provides a way to send commands to motors attached to ports.
     * e.g. start motor, etc
     */
    public get motors(): IMotorsFeature {
        if (!this._motors) {
            throw new Error('Hub not connected');
        }
        return this._motors;
    }

    /**
     * Provides a way to access the properties of the hub.
     * e.g. listen to battery level changes, set hub advertising name, etc.
     */
    public get properties(): IHubPropertiesFeature {
        if (!this._properties) {
            throw new Error('Hub not connected');
        }
        return this._properties;
    }

    /**
     * Emits when the hub disconnect method is called but before the hub is actually disconnected.
     * Can be used to perform some cleanup before the hub is disconnected.
     */
    public get beforeDisconnect(): Observable<void> {
        if (!this._beforeDisconnect) {
            throw new Error('Hub not connected');
        }
        return this._beforeDisconnect;
    }

    /**
     * Emits when the hub is disconnected.
     * Can be used to perform actions after the hub is disconnected.
     */
    public get disconnected(): Observable<void> {
        if (!this._disconnected$) {
            throw new Error('Hub not connected');
        }
        return this._disconnected$;
    }

    /**
     * Connects to the hub.
     * Must be called before using any hub features.
     */
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
                this.logger.error('Hub connection failed');
                this.device.gatt.disconnect();
                this._isConnected = false;
                throw e;
            })
        ) as Observable<void>;
    }

    /**
     * Disconnects from the hub.
     */
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

        const dataStream = this.characteristicsDataStreamFactory.create(
            primaryCharacteristic,
            {
                incomingMessageMiddleware: this.config.incomingMessageMiddleware,
            }
        );

        this._genericErrors = this.messageListenerFactory.create(
            dataStream,
            this.replyParser,
            this._beforeDisconnect
        ).pipe(
            map((r) => ({ commandType: r.commandType, code: r.code })),
            share()
        );

        const messenger = this.outboundMessengerFactory.create(
            dataStream,
            this._genericErrors,
            primaryCharacteristic,
            this.config.outgoingMessageMiddleware,
            this._beforeDisconnect,
            this.logger,
            this.config
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
