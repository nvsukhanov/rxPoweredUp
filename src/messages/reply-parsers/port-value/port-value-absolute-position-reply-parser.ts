import { injectable } from 'tsyringe';

import { IReplyParser } from '../../../hub';
import { MessageType, PortModeName } from '../../../constants';
import { PortValueAbsolutePositionInboundMessage, RawMessage } from '../../../types';
import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../../helpers';

@injectable()
export class PortValueAbsolutePositionReplyParser implements IReplyParser<MessageType.portValueSingle> {
    public readonly messageType = MessageType.portValueSingle;

    public parseMessage(
        message: RawMessage<MessageType.portValueSingle>
    ): PortValueAbsolutePositionInboundMessage {
        const rawValue = readNumberFromUint8LEArray(message.payload.slice(1, 5));
        const absolutePosition = convertUint16ToSignedInt(rawValue);
        return {
            messageType: this.messageType,
            portId: message.payload[0],
            modeName: PortModeName.absolutePosition,
            absolutePosition
        };
    }
}
