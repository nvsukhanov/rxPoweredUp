import { Observable, filter, from, map, share, switchMap, take, tap } from 'rxjs';

import { HubProperty, MAX_NAME_SIZE, SubscribableHubProperties } from '../../constants';
import { HubPropertiesOutboundMessageFactory } from '../../messages';
import { ConnectionErrorFactory } from '../../errors';
import { ILogger } from '../../logging';
import { HubPropertyInboundMessage } from '../../types';
import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IOutboundMessenger } from '../i-outbound-messenger';

export class HubPropertiesFeature implements IHubPropertiesFeature {
    public batteryLevel$ = this.createPropertyStream(HubProperty.batteryVoltage);

    public rssiLevel$ = this.createPropertyStream(HubProperty.RSSI);

    public buttonState$ = this.createPropertyStream(HubProperty.button);

    private readonly characteristicUnsubscribeHandlers = new Map<SubscribableHubProperties, () => Promise<void>>();

    constructor(
        private _advertisingName: string,
        private readonly messageFactoryService: HubPropertiesOutboundMessageFactory,
        private readonly messenger: IOutboundMessenger,
        private readonly logging: ILogger,
        private readonly inboundMessages: Observable<HubPropertyInboundMessage>,
        private readonly errorsFactory: ConnectionErrorFactory
    ) {
    }

    public get advertisingName(): string {
        return this._advertisingName;
    }

    public setHubAdvertisingName(
        advertisingName: string
    ): Observable<void> {
        if (advertisingName.length > MAX_NAME_SIZE || advertisingName.length === 0) {
            throw this.errorsFactory.createInvalidPropertyValueError(HubProperty.advertisingName, advertisingName);
        }
        const charCodes = advertisingName.split('').map((char) => char.charCodeAt(0));
        const message = this.messageFactoryService.setProperty(HubProperty.advertisingName, charCodes);

        const requestStream = this.messenger.sendWithoutResponse(message);

        requestStream.subscribe(() => this._advertisingName = advertisingName);

        return requestStream;
    }

    public async disconnect(): Promise<void> {
        for (const unsubscribeHandler of this.characteristicUnsubscribeHandlers.values()) {
            await unsubscribeHandler();
        }
    }

    public getPropertyValue$<T extends HubProperty>(
        property: T
    ): Observable<HubPropertyInboundMessage & { propertyType: T }> {
        const message = this.messageFactoryService.requestPropertyUpdate(property);
        const replies = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === property),
            map((reply) => reply as HubPropertyInboundMessage & { propertyType: T }),
            take(1)
        );
        return this.messenger.sendWithResponse(message, replies);
    }

    private async sendSubscribeMessage(
        property: SubscribableHubProperties
    ): Promise<void> {
        if (this.characteristicUnsubscribeHandlers.has(property)) {
            return;
        }
        const message = this.messageFactoryService.createSubscriptionMessage(property);
        this.messenger.sendWithoutResponse(message);
        this.characteristicUnsubscribeHandlers.set(property, async (): Promise<void> => {
            this.messageFactoryService.createUnsubscriptionMessage(property);
            await this.messenger.sendWithoutResponse(message);
        });
    }

    private createPropertyStream<T extends SubscribableHubProperties>(
        trackedProperty: T
    ): Observable<HubPropertyInboundMessage & { propertyType: T }> {
        return new Observable<HubPropertyInboundMessage & { propertyType: T }>((subscriber) => {
            this.logging.debug('subscribing to property stream', HubProperty[trackedProperty]);
            const sub = from(this.sendSubscribeMessage(trackedProperty)).pipe(
                tap(() => {
                    const message = this.messageFactoryService.requestPropertyUpdate(trackedProperty);
                    this.messenger.sendWithoutResponse(message);
                }),
                switchMap(() => this.inboundMessages),
                filter((reply) => reply.propertyType === trackedProperty),
            ).subscribe((message) => {
                subscriber.next(message as HubPropertyInboundMessage & { propertyType: T });
            });

            return (): void => {
                this.logging.debug('unsubscribing from property stream', HubProperty[trackedProperty]);
                sub.unsubscribe();
            };
        }).pipe(
            share()
        );
    }
}
