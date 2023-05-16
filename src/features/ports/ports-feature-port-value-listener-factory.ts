import { Observable } from 'rxjs';

import { MessageType, PortModeName } from '../../constants';
import { PortValueInboundMessage, RawMessage } from '../../types';
import { IInboundMessageListenerFactory } from '../i-inbound-message-listener-factory';
import { IReplyParser } from '../i-reply-parser';

export class PortsFeaturePortValueListenerFactory {
    private readonly portValueParsers: { [m in PortModeName]?: IReplyParser<MessageType.portValueSingle> } = {
        [PortModeName.absolutePosition]: this.portValueAbsolutePositionReplyParserService,
        [PortModeName.speed]: this.portValueSpeedReplyParserService
    };

    constructor(
        private readonly portValueAbsolutePositionReplyParserService: IReplyParser<MessageType.portValueSingle>,
        private readonly portValueSpeedReplyParserService: IReplyParser<MessageType.portValueSingle>,
        private readonly messageListenerFactory: IInboundMessageListenerFactory,
        private readonly characteristicDataStream: Observable<RawMessage<MessageType>>,
        private readonly onDisconnected$: Observable<void>,
    ) {
    }

    public createForMode(
        modeName: PortModeName
    ): Observable<PortValueInboundMessage> {
        const replyParserService = this.portValueParsers[modeName];
        if (!replyParserService) {
            throw new Error(`No reply parser for mode ${modeName}`);
        }
        return this.messageListenerFactory.create(
            this.characteristicDataStream,
            replyParserService,
            this.onDisconnected$,
        );
    }
}
