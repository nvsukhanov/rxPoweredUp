import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { IoFeature } from './io-feature';
import { MessageType } from '../../constants';
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
import { IPortInformationRequestMessageFactory, PORT_INFORMATION_REQUEST_MESSAGE_FACTORY } from './i-port-information-request-message-factory';
import { IPortModeInformationRequestMessageFactory, PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY } from './i-port-mode-information-request-message-factory';
import { IPortInputFormatSetupMessageFactory, PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY } from './i-port-input-format-setup-message-factory';
import { AttachedIoRepliesCache } from './attached-io-replies-cache';

@injectable()
export class IoFeatureFactory {
    constructor(
        @inject(PORT_INFORMATION_REQUEST_MESSAGE_FACTORY) private readonly portInformationRequestMessageFactory: IPortInformationRequestMessageFactory,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_INFORMATION_REPLY_PARSER) private readonly portInformationRequestReplyParser: IReplyParser<MessageType.portInformation>,
        @inject(ATTACHED_IO_REPLIES_PARSER) private readonly attachedIoReplyParser: IReplyParser<MessageType.attachedIO>,
        @inject(PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER) private readonly portValueAbsolutePositionReplyParser: IReplyParser<MessageType.portValueSingle>,
        @inject(PORT_VALUE_SPEED_REPLY_PARSER) private readonly portValueSpeedReplyParser: IReplyParser<MessageType.portValueSingle>,
        @inject(PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY) private readonly portModeInformationMessageFactory: IPortModeInformationRequestMessageFactory,
        @inject(PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY) private readonly portInputFormatSetupSingleMessageFactory: IPortInputFormatSetupMessageFactory,
        @inject(PORT_MODE_INFORMATION_REPLY_PARSER) private readonly portModeInformationReplyParserService: IReplyParser<MessageType.portModeInformation>,
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

        const attachedIOCache = new AttachedIoRepliesCache(
            attachedIOReplies$,
            onHubDisconnected
        );

        return new IoFeature(
            portInformationReplies$,
            attachedIOCache.replies$,
            portModeInformationReplies$,
            this.portInformationRequestMessageFactory,
            portValueListenerFactory,
            this.portModeInformationMessageFactory,
            this.portInputFormatSetupSingleMessageFactory,
            messenger
        );
    }
}
