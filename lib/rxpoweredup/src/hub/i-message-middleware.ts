import { MessageType } from '../constants';
import { RawMessage } from '../types';

export interface IMessageMiddleware {
    handle<T extends RawMessage<MessageType>>(message: T): T;
}
