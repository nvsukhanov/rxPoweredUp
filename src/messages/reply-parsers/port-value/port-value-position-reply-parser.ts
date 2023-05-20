import { injectable } from 'tsyringe';

import { IReplyParser } from '../../../hub';
import { MessageType, PortModeName } from '../../../constants';
import { PortValuePositionInboundMessage, RawMessage } from '../../../types';
import { convertUint32ToSignedInt, readNumberFromUint8LEArray } from '../../../helpers';

@injectable()
export class PortValuePositionReplyParser implements IReplyParser<MessageType.portValueSingle> {
    public readonly messageType = MessageType.portValueSingle;

    public parseMessage(
        message: RawMessage<MessageType.portValueSingle>
    ): PortValuePositionInboundMessage {
        const rawValue = readNumberFromUint8LEArray(message.payload.slice(1, 5));
        const position = convertUint32ToSignedInt(rawValue);
        return {
            messageType: this.messageType,
            portId: message.payload[0],
            modeName: PortModeName.position,
            position
        };
    }
}
