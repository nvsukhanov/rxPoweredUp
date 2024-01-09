import { Observable, distinctUntilChanged, filter, finalize, map, of, share, switchMap, takeUntil } from 'rxjs';

import { HubProperty, HubType, MAX_NAME_SIZE, SubscribableHubProperties } from '../../constants';
import type {
    HubPropertyAdvertisingNameInboundMessage,
    HubPropertyBatteryInboundMessage,
    HubPropertyButtonStateInboundMessage,
    HubPropertyInboundMessage,
    HubPropertyManufacturerNameInboundMessage,
    HubPropertyPrimaryMacAddressInboundMessage,
    HubPropertyRssiInboundMessage,
    HubPropertySystemTypeIdInboundMessage,
    ILogger
} from '../../types';
import { IHubPropertiesFeature, IOutboundMessenger } from '../../hub';
import { IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';

export class HubPropertiesFeature implements IHubPropertiesFeature {
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
        private readonly errorsFactory: IHubPropertiesFeatureErrorsFactory,
        private readonly onDisconnected$: Observable<void>
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

    public getAdvertisingName(): Observable<string> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.advertisingName);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.advertisingName),
        ) as Observable<HubPropertyAdvertisingNameInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.advertisingName),
        );
    }

    public getBatteryLevel(): Observable<number> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.batteryVoltage);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.batteryVoltage)
        ) as Observable<HubPropertyBatteryInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.level),
        );
    }

    public getButtonState(): Observable<boolean> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.button);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.button)
        ) as Observable<HubPropertyButtonStateInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.isPressed),
        );
    }

    public getPrimaryMacAddress(): Observable<string> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.primaryMacAddress);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.primaryMacAddress)
        ) as Observable<HubPropertyPrimaryMacAddressInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.macAddress),
        );
    }

    public getRSSILevel(): Observable<number> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.RSSI);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.RSSI)
        ) as Observable<HubPropertyRssiInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.level),
        );
    }

    public getSystemTypeId(): Observable<HubType> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.systemTypeId);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.systemTypeId)
        ) as Observable<HubPropertySystemTypeIdInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.hubType),
        );
    }

    public getManufacturerName(): Observable<string> {
        const message = this.messageFactoryService.requestPropertyUpdate(HubProperty.manufacturerName);
        const reply = this.inboundMessages.pipe(
            filter((r) => r.propertyType === HubProperty.manufacturerName)
        ) as Observable<HubPropertyManufacturerNameInboundMessage>;
        return this.messenger.sendWithResponse({ message, reply }).pipe(
            map((r) => r.manufacturerName),
        );
    }

    private sendSubscribeMessage(
        property: SubscribableHubProperties
    ): Observable<void> {
        if (this.characteristicUnsubscribeHandlers.has(property)) {
            return of(void 0);
        }
        const subscribeMessage = this.messageFactoryService.createSubscriptionMessage(property);

        this.characteristicUnsubscribeHandlers.set(property, () => {
            const unsubscribeMessage = this.messageFactoryService.createUnsubscriptionMessage(property);
            return new Observable((subscriber) => {
                if (this.characteristicUnsubscribeHandlers.has(property)) {
                    this.logging.debug(`Sending unsubscribe message for property ${HubProperty[property]}`);
                    this.characteristicUnsubscribeHandlers.delete(property);
                    this.messenger.sendWithoutResponse(unsubscribeMessage).subscribe({
                        complete: () => {
                            subscriber.next();
                            subscriber.complete();
                        },
                        error: (err) => {
                            subscriber.error(err);
                        }
                    });
                } else {
                    subscriber.next();
                    subscriber.complete();
                }
                return () => void 0;
            });
        });

        return this.messenger.sendWithoutResponse(subscribeMessage);
    }

    private createPropertyStream<T extends SubscribableHubProperties>(
        trackedProperty: T
    ): Observable<HubPropertyInboundMessage & { propertyType: T }> {
        return new Observable<HubPropertyInboundMessage & { propertyType: T }>((subscriber) => {
            this.logging.debug('subscribing to property stream', HubProperty[trackedProperty]);
            const sub = this.sendSubscribeMessage(trackedProperty).pipe(
                switchMap(() => this.inboundMessages),
                filter((reply) => reply.propertyType === trackedProperty),
                takeUntil(this.onDisconnected$),
                finalize(() => {
                    this.characteristicUnsubscribeHandlers.get(trackedProperty)?.().subscribe();
                })
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
