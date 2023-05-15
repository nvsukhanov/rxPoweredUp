import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { HubPropertiesOutboundMessageFactory } from '../../messages';
import { MessageType } from '../../constants';
import { HubPropertiesFeature } from './hub-properties-feature';
import { ConnectionErrorFactory } from '../../errors';
import { ILogger } from '../../logging';
import { RawMessage } from '../../types';
import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IOutboundMessenger } from '../i-outbound-messenger';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from '../i-inbound-message-listener-factory';
import { HUB_PROPERTIES_REPLIES_PARSER } from './hub-properties-reply-parser';
import { IReplyParser } from '../i-reply-parser';

@injectable()
export class HubPropertiesFeatureFactory {
    constructor(
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(HUB_PROPERTIES_REPLIES_PARSER) private readonly replyParserService: IReplyParser<MessageType.properties>,
        private readonly messageFactoryService: HubPropertiesOutboundMessageFactory,
        private readonly errorsFactory: ConnectionErrorFactory
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
            this.replyParserService,
            onHubDisconnected,
        );
        return new HubPropertiesFeature(
            advertisingName,
            this.messageFactoryService,
            messenger,
            logger,
            replies$,
            this.errorsFactory
        );
    }
}
