import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import type { IHubActionsFeature, IHubActionsFeatureFactory, IInboundMessageListenerFactory, IOutboundMessenger, IReplyParser } from '../../hub';
import { INBOUND_MESSAGE_LISTENER_FACTORY } from '../../hub';
import { HubActionsFeature } from './hub-actions-feature';
import { HUB_ACTIONS_REPLY_PARSER } from './hub-actions-reply-parser';
import { MessageType } from '../../constants';
import type { RawMessage } from '../../types';
import type { IHubActionsMessageFactory } from './i-hub-actions-message-factory';
import { HUB_ACTIONS_MESSAGE_FACTORY } from './i-hub-actions-message-factory';

@injectable()
export class HubActionsFeatureFactory implements IHubActionsFeatureFactory {
  constructor(
    @inject(HUB_ACTIONS_REPLY_PARSER) private readonly hubActionsReplyParser: IReplyParser<MessageType.action>,
    @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
    @inject(HUB_ACTIONS_MESSAGE_FACTORY) private readonly hubActionsMessageFactory: IHubActionsMessageFactory
  ) {}

  public create(
    characteristicDataStream: Observable<RawMessage<MessageType>>,
    messenger: IOutboundMessenger,
    onDisconnected$: Observable<void>
  ): IHubActionsFeature {
    const inboundMessages = this.messageListenerFactory.create(characteristicDataStream, this.hubActionsReplyParser, onDisconnected$);
    return new HubActionsFeature(this.hubActionsMessageFactory, messenger, inboundMessages);
  }
}
