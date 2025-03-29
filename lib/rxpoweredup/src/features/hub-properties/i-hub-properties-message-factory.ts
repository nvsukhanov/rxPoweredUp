import { InjectionToken } from 'tsyringe';

import { HubProperty, MessageType, SubscribableHubProperties, WritableHubProperties } from '../../constants';
import { RawMessage } from '../../types';

export interface IHubPropertiesMessageFactory {
  setProperty(property: WritableHubProperties, value: number[]): RawMessage<MessageType.properties>;

  requestPropertyUpdate(property: HubProperty): RawMessage<MessageType.properties>;

  createSubscriptionMessage<TProp extends SubscribableHubProperties>(
    property: TProp
  ): RawMessage<MessageType.properties>;

  createUnsubscriptionMessage<TProp extends SubscribableHubProperties>(
    property: TProp
  ): RawMessage<MessageType.properties>;
}

export const HUB_PROPERTIES_MESSAGE_FACTORY: InjectionToken<IHubPropertiesMessageFactory> = Symbol(
  'HUB_PROPERTIES_MESSAGE_FACTORY'
);
