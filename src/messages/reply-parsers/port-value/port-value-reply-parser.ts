import { injectable } from 'tsyringe';

import { MessageType } from '../../../constants';
import { PortValueInboundMessage, RawMessage } from '../../../types';
import { IReplyParser } from '../../../hub';

@injectable()
export class PortValueReplyParser implements IReplyParser<MessageType.portValueSingle> {
    public readonly messageType = MessageType.portValueSingle;

    public parseMessage(
        message: RawMessage<MessageType.portValueSingle>
    ): PortValueInboundMessage {
        return {
            messageType: this.messageType,
            portId: message.payload[0],
            value: [ ...message.payload.slice(1) ]
        };
    }
}
