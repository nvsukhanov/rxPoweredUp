import { IoFeature } from './io-feature';
import {
    AttachedIoReplyParser,
    InboundMessageListenerFactory,
    IOutboundMessenger,
    PortInformationReplyParser,
    PortInformationRequestOutboundMessageFactory,
    PortInputFormatSetupSingleOutboundMessageFactory,
    PortModeInformationReplyParser,
    PortModeInformationRequestOutboundMessageFactory,
    PortValueReplyParserResolver,
} from '../../messages';
import { Observable } from 'rxjs';
import { MessageType } from '../../constants';
import { AttachedIoRepliesCacheFactory } from './attached-io-replies-cache-factory';
import { IoFeaturePortValueListenerFactory } from './io-feature-port-value-listener-factory';
import { injectable } from 'tsyringe';
import { RawMessage } from '../../types';
import { IIoFeature } from './i-io-feature';

@injectable()
export class IoFeatureFactory {
    constructor(
        private readonly messageFactoryService: PortInformationRequestOutboundMessageFactory,
        private readonly inboundMessageListenerFactory: InboundMessageListenerFactory,
        private readonly portInformationRequestReplyParserService: PortInformationReplyParser,
        private readonly attachedIoReplyParserService: AttachedIoReplyParser,
        private readonly portModeInformationOutboundMessageFactoryService: PortModeInformationRequestOutboundMessageFactory,
        private readonly portInputFormatSetupSingleOutboundMessageFactoryService: PortInputFormatSetupSingleOutboundMessageFactory,
        private readonly portModeInformationReplyParserService: PortModeInformationReplyParser,
        private readonly attachedIoRepliesCacheFactoryService: AttachedIoRepliesCacheFactory,
        private readonly portValueReplyParserResolverService: PortValueReplyParserResolver
    ) {
    }

    public create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger
    ): IIoFeature {
        const portInformationMessageListener = this.inboundMessageListenerFactory.create(
            characteristicDataStream,
            this.portInformationRequestReplyParserService,
            onHubDisconnected,
        );

        const portValueListenerFactory = new IoFeaturePortValueListenerFactory(
            this.inboundMessageListenerFactory,
            this.portValueReplyParserResolverService,
            characteristicDataStream,
            onHubDisconnected
        );

        const attachedIOMessageListener = this.inboundMessageListenerFactory.create(
            characteristicDataStream,
            this.attachedIoReplyParserService,
            onHubDisconnected,
        );

        const portModeInformationMessageListener = this.inboundMessageListenerFactory.create(
            characteristicDataStream,
            this.portModeInformationReplyParserService,
            onHubDisconnected,
        );

        return new IoFeature(
            this.messageFactoryService,
            portInformationMessageListener,
            portValueListenerFactory,
            attachedIOMessageListener,
            portModeInformationMessageListener,
            this.portModeInformationOutboundMessageFactoryService,
            this.portInputFormatSetupSingleOutboundMessageFactoryService,
            messenger,
            this.attachedIoRepliesCacheFactoryService,
            onHubDisconnected,
        );
    }
}
