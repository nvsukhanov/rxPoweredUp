import { MessageType } from '../constants';
import { InboundMessage } from '../types/inbound-message';

import { RawMessage } from '../types/raw-message';

export interface IReplyParser<T extends MessageType> {
    readonly messageType: T;

    parseMessage(message: RawMessage<T>): InboundMessage & { messageType: T };
}
