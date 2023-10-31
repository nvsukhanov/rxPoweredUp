import { Observable, ReplaySubject, catchError, from, fromEvent, of, share, switchMap, take, tap, timeout } from 'rxjs';

import { HUB_CHARACTERISTIC_UUID, HUB_SERVICE_UUID, MessageType } from '../constants';
import { IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { BluetoothDeviceWithGatt, IDisposable, ILogger } from '../types';
import { IHub } from './i-hub';
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
import { IHubActionsFeatureFactory } from './i-hub-actions-feature-factory';
import { IHubActionsFeature } from './i-hub-actions-feature';
import { IOutboundMessenger } from './i-outbound-messenger';
import { ISensorsFeatureFactory } from './i-sensors-feature-factory';
import { ISensorsFeature } from './i-sensors-feature';

export class Hub implements IHub {
    private readonly gattServerDisconnectEventName = 'gattserverdisconnected';

    private _ports?: IPortsFeature & IDisposable;

    private _motors?: IMotorsFeature;

    private _properties?: IHubPropertiesFeature;

    private _isConnected = false;

    private _disconnected$ = new ReplaySubject<void>(1);

    private _actionsFeature?: IHubActionsFeature;

    private _sensors?: ISensorsFeature;

    private outboundMessenger?: IOutboundMessenger;

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
        private readonly genericErrorReplyParser: IReplyParser<MessageType.genericError>,
        private readonly messageListenerFactory: IInboundMessageListenerFactory,
        private readonly hubActionsFeatureFactory: IHubActionsFeatureFactory,
        private readonly sensorsFeatureFactory: ISensorsFeatureFactory
    ) {
    }

    public get willSwitchOff(): Observable<void> {
        if (!this._actionsFeature) {
            throw new Error('Hub not connected');
        }
        return this._actionsFeature.willSwitchOff;
    }

    public get willDisconnect(): Observable<void> {
        if (!this._actionsFeature?.willDisconnect) {
            throw new Error('Hub not connected');
        }
        return this._actionsFeature.willDisconnect;
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

    public get sensors(): ISensorsFeature {
        if (!this._sensors) {
            throw new Error('Hub not connected');
        }
        return this._sensors;
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
                    take(1),
                    tap(() => this.logger.debug('GATT server disconnected')),
                ).subscribe({
                    complete: () => {
                        this._ports?.dispose();
                        this.outboundMessenger?.dispose();
                        this._isConnected = false;
                        this._disconnected$.next();
                        this._disconnected$.complete();
                        this.logger.debug('Disconnected subject completed');
                    }
                });
            }),
            timeout(this.config.hubConnectionTimeoutMs),
            switchMap((primaryCharacteristic) => from(this.createFeatures(primaryCharacteristic))),
            tap(() => {
                this._isConnected = true;
                this.logger.debug('Hub connection successful');
            }),
            take(1),
            catchError((e) => {
                this.logger.error('Hub connection failed');
                this.device.gatt.disconnect();
                this._disconnected$.next();
                this._isConnected = false;
                throw e;
            })
        ) as Observable<void>;
    }

    public disconnect(): Observable<void> {
        if (!this._actionsFeature) {
            throw new Error('Hub not connected');
        }
        this.logger.debug('Disconnect invoked');
        return this._actionsFeature.disconnect();
    }

    public switchOff(): Observable<void> {
        if (!this._actionsFeature) {
            throw new Error('Hub not connected');
        }
        this.logger.debug('Switch off invoked');
        return this._actionsFeature.switchOff();
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

        const genericErrorsStream = this.messageListenerFactory.create(
            dataStream,
            this.genericErrorReplyParser,
            this._disconnected$
        ).pipe(
            share()
        );

        this.outboundMessenger = this.outboundMessengerFactory.create(
            dataStream,
            genericErrorsStream,
            primaryCharacteristic,
            this._disconnected$,
            this.logger,
            this.config
        );

        this._actionsFeature = this.hubActionsFeatureFactory.create(
            dataStream,
            this.outboundMessenger,
            this._disconnected$,
        );

        this._ports = this.ioFeatureFactory.create(
            dataStream,
            this._disconnected$,
            this.outboundMessenger
        );

        this._properties = this.propertiesFeatureFactory.create(
            dataStream,
            this._disconnected$,
            this.outboundMessenger,
            this.logger
        );

        this._motors = this.commandsFeatureFactory.createCommandsFeature(
            this.outboundMessenger,
            this._ports,
            this.config
        );

        this._sensors = this.sensorsFeatureFactory.createSensorsFeature(
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
