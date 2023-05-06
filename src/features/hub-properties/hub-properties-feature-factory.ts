import { HubPropertiesOutboundMessageFactory, HubPropertiesReplyParser, InboundMessageListenerFactory, IOutboundMessenger } from '../../messages';
import { Observable } from 'rxjs';
import { MessageType } from '../../constants';
import { HubPropertiesFeature } from './hub-properties-feature';
import { ConnectionErrorFactory } from '../../errors';
import { injectable } from 'tsyringe';
import { ILogger } from '../../logging';
import { RawMessage } from '../../types';
import { IHubPropertiesFeature } from './i-hub-properties-feature';

@injectable()
export class HubPropertiesFeatureFactory {
    constructor(
        private readonly featureMessageProviderFactoryService: InboundMessageListenerFactory,
        private readonly replyParserService: HubPropertiesReplyParser,
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
        const repliesProvider = this.featureMessageProviderFactoryService.create(
            characteristicDataStream,
            this.replyParserService,
            onHubDisconnected,
        );
        return new HubPropertiesFeature(
            advertisingName,
            this.messageFactoryService,
            messenger,
            logger,
            repliesProvider,
            this.errorsFactory
        );
    }
}
