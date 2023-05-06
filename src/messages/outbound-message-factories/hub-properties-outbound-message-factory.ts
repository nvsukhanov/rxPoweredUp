import { injectable } from 'tsyringe';

import { HubProperty, HubPropertyOperation, MessageType, SubscribableHubProperties, WritableHubProperties } from '../../constants';
import { RawMessage } from '../../types';

@injectable()
export class HubPropertiesOutboundMessageFactory {
    public setProperty(
        property: WritableHubProperties,
        value: number[]
    ): RawMessage<MessageType.properties> {
        return {
            header: {
                messageType: MessageType.properties,
            },
            payload: Uint8Array.from([
                property,
                HubPropertyOperation.setProperty,
                ...value
            ])
        };
    }

    public requestPropertyUpdate(property: HubProperty): RawMessage<MessageType.properties> {
        return {
            header: {
                messageType: MessageType.properties,
            },
            payload: Uint8Array.from([
                property,
                HubPropertyOperation.requestUpdate
            ])
        };
    }

    public createSubscriptionMessage<TProp extends SubscribableHubProperties>(
        property: TProp
    ): RawMessage<MessageType.properties> {
        return {
            header: {
                messageType: MessageType.properties,
            },
            payload: Uint8Array.from([
                property,
                HubPropertyOperation.enableUpdates
            ])
        };
    }

    public createUnsubscriptionMessage<TProp extends SubscribableHubProperties>(
        property: TProp
    ): RawMessage<MessageType.properties> {
        return {
            header: {
                messageType: MessageType.properties,
            },
            payload: Uint8Array.from([
                property,
                HubPropertyOperation.disableUpdates
            ])
        };
    }
}
