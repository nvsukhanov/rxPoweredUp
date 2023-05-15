import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { MessageType } from '../../constants';
import { HubPropertiesFeature } from './hub-properties-feature';
import { ILogger } from '../../i-logger';
import { RawMessage } from '../../types';
import { IHubPropertiesFeature, IHubPropertiesFeatureFactory } from '../../hub';
import { IOutboundMessenger } from '../i-outbound-messenger';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from '../i-inbound-message-listener-factory';
import { HUB_PROPERTIES_REPLIES_PARSER } from './hub-properties-reply-parser';
import { IReplyParser } from '../i-reply-parser';
import { HUB_PROPERTIES_MESSAGE_FACTORY, IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';

@injectable()
export class HubPropertiesFeatureFactory implements IHubPropertiesFeatureFactory {
    constructor(
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(HUB_PROPERTIES_REPLIES_PARSER) private readonly replyParser: IReplyParser<MessageType.properties>,
        @inject(HUB_PROPERTIES_MESSAGE_FACTORY) private readonly messageFactory: IHubPropertiesMessageFactory,
        @inject(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY) private readonly errorsFactory: IHubPropertiesFeatureErrorsFactory
    ) {
    }

    public create(
        advertisingName: string,
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger,
        logger: ILogger
    ): IHubPropertiesFeature {
        const replies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.replyParser,
            onHubDisconnected,
        );
        return new HubPropertiesFeature(
            advertisingName,
            this.messageFactory,
            messenger,
            logger,
            replies$,
            this.errorsFactory
        );
    }
}
