import { Observable, filter, map, share, takeUntil } from 'rxjs';
import { injectable } from 'tsyringe';

import { MessageType } from '../constants';
import { IReplyParser } from './i-reply-parser';
import { InboundMessage, RawMessage } from '../types';
import { IInboundMessageListenerFactory } from './i-inbound-message-listener-factory';

@injectable()
export class InboundMessageListenerFactory implements IInboundMessageListenerFactory {
    public create<TMessageType extends MessageType>(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        replyParserService: IReplyParser<TMessageType>,
        onDisconnected$: Observable<void>,
    ): Observable<InboundMessage & { messageType: TMessageType }> {
        return characteristicDataStream.pipe(
            filter((message) => message.header.messageType === replyParserService.messageType),
            map((message) => replyParserService.parseMessage(message as RawMessage<TMessageType>)),
            takeUntil(onDisconnected$),
            share()
        );
    }
}
