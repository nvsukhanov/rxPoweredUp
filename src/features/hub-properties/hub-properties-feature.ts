import { Observable, filter, from, map, share, switchMap, tap } from 'rxjs';

import { HubProperty, MAX_NAME_SIZE, SubscribableHubProperties } from '../../constants';
import { HubPropertyInboundMessage, IDisposable, ILogger } from '../../types';
import { IHubPropertiesFeature, IOutboundMessenger } from '../../hub';
import { IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';

export class HubPropertiesFeature implements IHubPropertiesFeature, IDisposable {
    public batteryLevel$ = this.createPropertyStream(HubProperty.batteryVoltage);

    public rssiLevel$ = this.createPropertyStream(HubProperty.RSSI);

    public buttonState$ = this.createPropertyStream(HubProperty.button);

    private readonly characteristicUnsubscribeHandlers = new Map<SubscribableHubProperties, () => Promise<void>>();

    constructor(
        private _advertisingName: string,
        private readonly messageFactoryService: IHubPropertiesMessageFactory,
        private readonly messenger: IOutboundMessenger,
        private readonly logging: ILogger,
        private readonly inboundMessages: Observable<HubPropertyInboundMessage>,
        private readonly errorsFactory: IHubPropertiesFeatureErrorsFactory
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

    public async dispose(): Promise<void> {
        for (const unsubscribeHandler of this.characteristicUnsubscribeHandlers.values()) {
            await unsubscribeHandler();
        }
    }

    public getPropertyValue<T extends HubProperty>(
        property: T
    ): Observable<HubPropertyInboundMessage & { propertyType: T }> {
        const message = this.messageFactoryService.requestPropertyUpdate(property);
        const replies = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === property),
            map((reply) => reply as HubPropertyInboundMessage & { propertyType: T }),
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
