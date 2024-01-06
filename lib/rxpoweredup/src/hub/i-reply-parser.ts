import { MessageType } from '../constants';
import { InboundMessage, RawMessage } from '../types';

export interface IReplyParser<T extends MessageType> {
    readonly messageType: T;

    parseMessage(message: RawMessage<T>): InboundMessage & { messageType: T };
}
