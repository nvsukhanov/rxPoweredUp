import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { MessageType } from '../../constants';
import { HubPropertiesFeature } from './hub-properties-feature';
import type { ILogger, RawMessage } from '../../types';
import { INBOUND_MESSAGE_LISTENER_FACTORY } from '../../hub';
import type { IHubPropertiesFeatureFactory, IInboundMessageListenerFactory, IOutboundMessenger, IReplyParser } from '../../hub';
import { HUB_PROPERTIES_REPLIES_PARSER } from './hub-properties-reply-parser';
import { HUB_PROPERTIES_MESSAGE_FACTORY } from './i-hub-properties-message-factory';
import type { IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { HUB_PROPERTIES_FEATURE_ERRORS_FACTORY } from './i-hub-properties-feature-errors-factory';
import type { IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';

@injectable()
export class HubPropertiesFeatureFactory implements IHubPropertiesFeatureFactory {
  constructor(
    @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
    @inject(HUB_PROPERTIES_REPLIES_PARSER) private readonly replyParser: IReplyParser<MessageType.properties>,
    @inject(HUB_PROPERTIES_MESSAGE_FACTORY) private readonly messageFactory: IHubPropertiesMessageFactory,
    @inject(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY) private readonly errorsFactory: IHubPropertiesFeatureErrorsFactory
  ) {}

  public create(
    characteristicDataStream: Observable<RawMessage<MessageType>>,
    onHubDisconnected: Observable<void>,
    messenger: IOutboundMessenger,
    logger: ILogger
  ): HubPropertiesFeature {
    const replies$ = this.messageListenerFactory.create(characteristicDataStream, this.replyParser, onHubDisconnected);
    return new HubPropertiesFeature(this.messageFactory, messenger, logger, replies$, this.errorsFactory, onHubDisconnected);
  }
}
