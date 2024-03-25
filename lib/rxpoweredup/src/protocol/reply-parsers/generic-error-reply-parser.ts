import { injectable } from 'tsyringe';

import { MessageType } from '../../constants';
import { GenericErrorInboundMessage, RawMessage } from '../../types';
import { IReplyParser } from '../../hub';

@injectable()
export class GenericErrorReplyParser implements IReplyParser<MessageType> {
    public readonly messageType = MessageType.genericError;

    public parseMessage(
        message: RawMessage<MessageType>
    ): GenericErrorInboundMessage {
        return {
            messageType: MessageType.genericError,
            commandType: message.payload[0],
            code: message.payload[1]
        };
    }
}
