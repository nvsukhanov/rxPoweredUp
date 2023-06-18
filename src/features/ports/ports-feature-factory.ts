import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { PortsFeature } from './ports-feature';
import { MessageType } from '../../constants';
import { RawMessage } from '../../types';
import {
    IInboundMessageListenerFactory,
    INBOUND_MESSAGE_LISTENER_FACTORY,
    IOutboundMessenger,
    IPortsFeature,
    IPortsFeatureFactory,
    IReplyParser
} from '../../hub';
import { PORT_INFORMATION_REPLY_PARSER } from './port-information-reply-parser';
import { ATTACHED_IO_REPLIES_PARSER } from './attached-io-replies-parser';
import { PORT_MODE_INFORMATION_REPLY_PARSER } from './port-mode-information-reply-parser';
import { IPortInformationRequestMessageFactory, PORT_INFORMATION_REQUEST_MESSAGE_FACTORY } from './i-port-information-request-message-factory';
import { IPortModeInformationRequestMessageFactory, PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY } from './i-port-mode-information-request-message-factory';
import { IPortInputFormatSetupMessageFactory, PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY } from './i-port-input-format-setup-message-factory';
import { AttachedIoRepliesCache } from './attached-io-replies-cache';
import { PORT_INPUT_FORMAT_SETUP_SINGLE_HANDSHAKE_REPLY_PARSER } from './port-input-format-setup-single-handshake-reply-parser';
import { PORT_RAW_VALUE_REPLY_PARSER } from './port-value-raw-reply-parser';
import { IVirtualPortSetupMessageFactory, VIRTUAL_PORT_SETUP_MESSAGE_FACTORY } from './i-virtual-port-setup-message-factory';

@injectable()
export class PortsFeatureFactory implements IPortsFeatureFactory {
    constructor(
        @inject(PORT_INFORMATION_REQUEST_MESSAGE_FACTORY) private readonly portInformationRequestMessageFactory: IPortInformationRequestMessageFactory,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_INFORMATION_REPLY_PARSER) private readonly portInformationRequestReplyParser: IReplyParser<MessageType.portInformation>,
        @inject(ATTACHED_IO_REPLIES_PARSER) private readonly attachedIoReplyParser: IReplyParser<MessageType.attachedIO>,
        @inject(PORT_INPUT_FORMAT_SETUP_SINGLE_HANDSHAKE_REPLY_PARSER) // insanely long names mean this is a truly enterprise-grade code!
        private readonly portInputFormatSetupSingleHandshakeReplyParser: IReplyParser<MessageType.portInputFormatSetupSingleHandshake>,
        @inject(PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY) private readonly portModeInformationMessageFactory: IPortModeInformationRequestMessageFactory,
        @inject(PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY) private readonly portInputFormatSetupSingleMessageFactory: IPortInputFormatSetupMessageFactory,
        @inject(PORT_MODE_INFORMATION_REPLY_PARSER) private readonly portModeInformationReplyParserService: IReplyParser<MessageType.portModeInformation>,
        @inject(PORT_RAW_VALUE_REPLY_PARSER) private readonly portRawValueReplyParser: IReplyParser<MessageType.portValueSingle>,
        @inject(VIRTUAL_PORT_SETUP_MESSAGE_FACTORY) private readonly virtualPortSetupMessageFactory: IVirtualPortSetupMessageFactory,
    ) {
    }

    public create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger
    ): IPortsFeature {
        const portInformationReplies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.portInformationRequestReplyParser,
            onHubDisconnected,
        );

        const portRawValueReplies = this.messageListenerFactory.create(
            characteristicDataStream,
            this.portRawValueReplyParser,
            onHubDisconnected,
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

        const portInputFormatSetupSingleReplies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.portInputFormatSetupSingleHandshakeReplyParser,
            onHubDisconnected,
        );

        const attachedIOCache = new AttachedIoRepliesCache(
            attachedIOReplies$,
            onHubDisconnected
        );

        return new PortsFeature(
            portInformationReplies$,
            attachedIOReplies$,
            attachedIOCache.replies$,
            portModeInformationReplies$,
            portInputFormatSetupSingleReplies$,
            this.portInformationRequestMessageFactory,
            portRawValueReplies,
            this.portModeInformationMessageFactory,
            this.portInputFormatSetupSingleMessageFactory,
            this.virtualPortSetupMessageFactory,
            messenger
        );
    }
}
