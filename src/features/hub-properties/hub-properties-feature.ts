import { Observable, combineLatest, distinctUntilChanged, filter, from, map, of, share, switchMap } from 'rxjs';

import { HubProperty, HubType, MAX_NAME_SIZE, SubscribableHubProperties } from '../../constants';
import {
    HubPropertyAdvertisingNameInboundMessage,
    HubPropertyBatteryInboundMessage,
    HubPropertyButtonStateInboundMessage,
    HubPropertyInboundMessage,
    HubPropertyPrimaryMacAddressInboundMessage,
    HubPropertyRssiInboundMessage,
    HubPropertySystemTypeIdInboundMessage,
    IDisposable,
    ILogger
} from '../../types';
import { IHubPropertiesFeature, IOutboundMessenger } from '../../hub';
import { IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';

export class HubPropertiesFeature implements IHubPropertiesFeature, IDisposable {
    public batteryLevel = this.createPropertyStream(HubProperty.batteryVoltage).pipe(
        map((r) => r.level),
        distinctUntilChanged(),
        share()
    );

    public rssiLevel = this.createPropertyStream(HubProperty.RSSI).pipe(
        map((r) => r.level),
        distinctUntilChanged(),
        share()
    );

    public buttonState = this.createPropertyStream(HubProperty.button).pipe(
        map((r) => r.isPressed),
        distinctUntilChanged(),
        share()
    );

    private readonly characteristicUnsubscribeHandlers = new Map<SubscribableHubProperties, () => Observable<void>>();

    constructor(
        private readonly messageFactoryService: IHubPropertiesMessageFactory,
        private readonly messenger: IOutboundMessenger,
        private readonly logging: ILogger,
        private readonly inboundMessages: Observable<HubPropertyInboundMessage>,
        private readonly errorsFactory: IHubPropertiesFeatureErrorsFactory
    ) {
    }

    public setHubAdvertisingName(
        advertisingName: string
    ): Observable<void> {
        if (advertisingName.length > MAX_NAME_SIZE || advertisingName.length === 0) {
            throw this.errorsFactory.createInvalidPropertyValueError(HubProperty.advertisingName, advertisingName);
        }
        const charCodes = advertisingName.split('').map((char) => char.charCodeAt(0));
        const message = this.messageFactoryService.setProperty(HubProperty.advertisingName, charCodes);

        return this.messenger.sendWithoutResponse(message);
    }

    public dispose(): Observable<void> {
        if (this.characteristicUnsubscribeHandlers.size) {
            return combineLatest([ ...this.characteristicUnsubscribeHandlers.values() ].map((f) => f())).pipe(
                map(() => void 0)
            );
        } else {
            return of(void 0);
        }
    }

    public getAdvertisingName(): Observable<string> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.advertisingName);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.advertisingName),
        ) as Observable<HubPropertyAdvertisingNameInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.advertisingName),
        );
    }

    public getBatteryLevel(): Observable<number> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.batteryVoltage);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.batteryVoltage)
        ) as Observable<HubPropertyBatteryInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.level),
        );
    }

    public getButtonState(): Observable<boolean> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.button);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.button)
        ) as Observable<HubPropertyButtonStateInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.isPressed),
        );
    }

    public getPrimaryMacAddress(): Observable<string> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.primaryMacAddress);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.primaryMacAddress)
        ) as Observable<HubPropertyPrimaryMacAddressInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.macAddress),
        );
    }

    public getRSSILevel(): Observable<number> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.RSSI);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.RSSI)
        ) as Observable<HubPropertyRssiInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.level),
        );
    }

    public getSystemTypeId(): Observable<HubType> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.systemTypeId);
        const reply = this.inboundMessages.pipe(
            filter((reply) => reply.propertyType === HubProperty.systemTypeId)
        ) as Observable<HubPropertySystemTypeIdInboundMessage>;
        return this.messenger.sendWithResponse(message, reply).pipe(
            map((reply) => reply.hubType),
        );
    }

    private sendSubscribeMessage(
        property: SubscribableHubProperties
    ): Observable<void> {
        if (this.characteristicUnsubscribeHandlers.has(property)) {
            return of(void 0);
        }
        const message = this.messageFactoryService.createSubscriptionMessage(property);

        this.characteristicUnsubscribeHandlers.set(property, () => {
            this.messageFactoryService.createUnsubscriptionMessage(property);
            return this.messenger.sendWithoutResponse(message);
        });

        return this.messenger.sendWithoutResponse(message);
    }

    private createPropertyStream<T extends SubscribableHubProperties>(
        trackedProperty: T
    ): Observable<HubPropertyInboundMessage & { propertyType: T }> {
        return new Observable<HubPropertyInboundMessage & { propertyType: T }>((subscriber) => {
            this.logging.debug('subscribing to property stream', HubProperty[trackedProperty]);
            const sub = from(this.sendSubscribeMessage(trackedProperty)).pipe(
                switchMap(() => this.inboundMessages),
                filter((reply) => reply.propertyType === trackedProperty),
            ).subscribe((message) => {
                subscriber.next(message as HubPropertyInboundMessage & { propertyType: T });
            });

            return (): void => {
                this.logging.debug('unsubscribing from property stream', HubProperty[trackedProperty]);
                sub.unsubscribe();
            };
        });
    }
}
