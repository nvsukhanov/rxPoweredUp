import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { MessageType } from '../constants';
import { InboundMessage, RawMessage } from '../types';
import { IReplyParser } from './i-reply-parser';

export interface IInboundMessageListenerFactory {
  create<TMessageType extends MessageType>(
    characteristicDataStream: Observable<RawMessage<MessageType>>,
    replyParserService: IReplyParser<TMessageType>,
    onDisconnected$: Observable<void>
  ): Observable<InboundMessage & { messageType: TMessageType }>;
}

export const INBOUND_MESSAGE_LISTENER_FACTORY: InjectionToken<IInboundMessageListenerFactory> = Symbol('IInboundMessageListenerFactory');
