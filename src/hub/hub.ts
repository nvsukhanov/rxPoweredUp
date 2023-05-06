import { fromEvent, map, NEVER, Observable, shareReplay, Subject, take, takeUntil, tap } from 'rxjs';
import { IMessageMiddleware } from '../middleware';
import { HUB_CHARACTERISTIC_UUID, HUB_SERVICE_UUID } from '../constants';
import { ConnectionErrorFactory } from '../errors';
import { CharacteristicDataStreamFactory, OutboundMessengerFactory } from '../messages';
import { HubPropertiesFeatureFactory, IHubPropertiesFeature, IIoFeature, IMotorFeature, IoFeatureFactory, MotorFeatureFactory } from '../features';
import { BluetoothDeviceWithGatt, ILegoHubConfig } from '../types';
import { ILogger } from '../logging';
import { IHub } from './i-hub';

export class Hub implements IHub {
    private readonly gattServerDisconnectEventName = 'gattserverdisconnected';

    private _ports: IIoFeature | undefined;

    private _motor: IMotorFeature | undefined;

    private _properties: IHubPropertiesFeature | undefined;

    private _isConnected = false;

    private _beforeDisconnect = new Subject<void>();

    private _primaryCharacteristic?: BluetoothRemoteGATTCharacteristic;

    private _disconnected$?: Observable<void>;

    constructor(
        private readonly device: BluetoothDeviceWithGatt,
        private readonly logger: ILogger,
        private readonly config: ILegoHubConfig,
        private readonly hubConnectionErrorFactory: ConnectionErrorFactory,
        private readonly outboundMessengerFactoryService: OutboundMessengerFactory,
        private readonly propertiesFactoryService: HubPropertiesFeatureFactory,
        private readonly ioFeatureFactoryService: IoFeatureFactory,
        private readonly characteristicsDataStreamFactoryService: CharacteristicDataStreamFactory,
        private readonly motorFeatureFactoryService: MotorFeatureFactory,
        private readonly incomingMessageMiddleware: IMessageMiddleware[] = [],
        private readonly outgoingMessageMiddleware: IMessageMiddleware[] = [],
        private readonly externalDisconnectEvents$: Observable<unknown> = NEVER
    ) {
    }

    public get ports(): IIoFeature {
        if (!this._ports) {
            throw new Error('Hub not connected');
        }
        return this._ports;
    }

    public get motor(): IMotorFeature {
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

    public get beforeDisconnect$(): Observable<void> {
        if (!this._beforeDisconnect) {
            throw new Error('Hub not connected');
        }
        return this._beforeDisconnect;
    }

    public get disconnected$(): Observable<void> {
        if (!this._disconnected$) {
            throw new Error('Hub not connected');
        }
        return this._disconnected$;
    }

    public async connect(): Promise<void> {
        if (this._isConnected) {
            throw new Error('Hub already connected');
        }
        this.logger.debug('Connecting to GATT server');
        const gatt = await this.connectGattServer(this.device);
        this.logger.debug('Connected to GATT server');

        try {
            const primaryService = await gatt.getPrimaryService(HUB_SERVICE_UUID);
            this.logger.debug('Got primary service');
            this._primaryCharacteristic = await primaryService.getCharacteristic(HUB_CHARACTERISTIC_UUID);
            this.logger.debug('Got primary characteristic');
            await this.createFeatures(this._primaryCharacteristic);
            this._isConnected = true;
            this.logger.debug('Hub connection successful');
        } catch (e) {
            gatt.disconnect();
            throw e;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this._isConnected) {
            throw new Error('Hub not connected');
        }
        this.logger.debug('Disconnection invoked');
        this._beforeDisconnect.next();
        await this._primaryCharacteristic?.stopNotifications();
        this.logger.debug('Stopped primary characteristic notifications');
        this.device.gatt.disconnect();
        this.logger.debug('Disconnected');
    }

    private async createFeatures(
        primaryCharacteristic: BluetoothRemoteGATTCharacteristic
    ): Promise<void> {
        this._disconnected$ = fromEvent(this.device, this.gattServerDisconnectEventName).pipe(
            tap(() => this.logger.debug('GATT server disconnected')),
            map(() => void 0),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        const messenger = this.outboundMessengerFactoryService.create(primaryCharacteristic, this.outgoingMessageMiddleware, this.logger);
        const dataStream = this.characteristicsDataStreamFactoryService.create(primaryCharacteristic, this.incomingMessageMiddleware);

        this._ports = this.ioFeatureFactoryService.create(
            dataStream,
            this.beforeDisconnect$,
            messenger
        );

        this._properties = this.propertiesFactoryService.create(
            this.device.name ?? '',
            dataStream,
            this.beforeDisconnect$,
            messenger,
            this.logger
        );

        this._motor = this.motorFeatureFactoryService.createMotorFeature(
            messenger
        );

        await primaryCharacteristic.startNotifications();
        this.logger.debug('Started primary characteristic notifications');

        const externalDisconnectSubscription = this.externalDisconnectEvents$.pipe(
            takeUntil(this.beforeDisconnect$),
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
