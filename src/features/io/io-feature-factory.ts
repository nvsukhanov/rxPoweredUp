import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { IoFeature } from './io-feature';
import {
    PortInformationRequestOutboundMessageFactory,
    PortInputFormatSetupSingleOutboundMessageFactory,
    PortModeInformationRequestOutboundMessageFactory,
} from '../../messages';
import { MessageType } from '../../constants';
import { AttachedIoRepliesCacheFactory } from './attached-io-replies-cache-factory';
import { IoFeaturePortValueListenerFactory } from './io-feature-port-value-listener-factory';
import { RawMessage } from '../../types';
import { IIoFeature } from './i-io-feature';
import { IOutboundMessenger } from '../i-outbound-messenger';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from '../i-inbound-message-listener-factory';
import { PORT_INFORMATION_REPLY_PARSER } from './port-information-reply-parser';
import { IReplyParser } from '../i-reply-parser';
import { ATTACHED_IO_REPLIES_PARSER } from './attached-io-replies-parser';
import { PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER } from './port-value-absolute-position-reply-parser';
import { PORT_VALUE_SPEED_REPLY_PARSER } from './port-value-speed-reply-parser';
import { PORT_MODE_INFORMATION_REPLY_PARSER } from './port-mode-information-reply-parser';

@injectable()
export class IoFeatureFactory {
    constructor(
        private readonly messageFactoryService: PortInformationRequestOutboundMessageFactory,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_INFORMATION_REPLY_PARSER) private readonly portInformationRequestReplyParser: IReplyParser<MessageType.portInformation>,
        @inject(ATTACHED_IO_REPLIES_PARSER) private readonly attachedIoReplyParser: IReplyParser<MessageType.attachedIO>,
        @inject(PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER) private readonly portValueAbsolutePositionReplyParser: IReplyParser<MessageType.portValueSingle>,
        @inject(PORT_VALUE_SPEED_REPLY_PARSER) private readonly portValueSpeedReplyParser: IReplyParser<MessageType.portValueSingle>,
        private readonly portModeInformationOutboundMessageFactoryService: PortModeInformationRequestOutboundMessageFactory,
        private readonly portInputFormatSetupSingleOutboundMessageFactoryService: PortInputFormatSetupSingleOutboundMessageFactory,
        @inject(PORT_MODE_INFORMATION_REPLY_PARSER) private readonly portModeInformationReplyParserService: IReplyParser<MessageType.portModeInformation>,
        private readonly attachedIoRepliesCacheFactoryService: AttachedIoRepliesCacheFactory,
    ) {
    }

    public create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger
    ): IIoFeature {
        const portInformationReplies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.portInformationRequestReplyParser,
            onHubDisconnected,
        );

        const portValueListenerFactory = new IoFeaturePortValueListenerFactory(
            this.portValueAbsolutePositionReplyParser,
            this.portValueSpeedReplyParser,
            this.messageListenerFactory,
            characteristicDataStream,
            onHubDisconnected
        );

        const attachedIOReplies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.attachedIoReplyParser,
            onHubDisconnected,
        );

        const portModeInformationReplies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.portModeInformationReplyParserService,
            onHubDisconnected,
        );

        const attachedIOCache = this.attachedIoRepliesCacheFactoryService.create(
            attachedIOReplies$,
            onHubDisconnected
        );

        return new IoFeature(
            portInformationReplies$,
            attachedIOCache.replies$,
            portModeInformationReplies$,
            this.messageFactoryService,
            portValueListenerFactory,
            this.portModeInformationOutboundMessageFactoryService,
            this.portInputFormatSetupSingleOutboundMessageFactoryService,
            messenger
        );
    }
}
