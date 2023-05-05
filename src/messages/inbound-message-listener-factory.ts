import { InboundMessageListener } from './inbound-message-listener';
import { MessageType } from '../constants';
import { Observable } from 'rxjs';
import { IReplyParser } from './i-reply-parser';
import { RawMessage } from './raw-message';
import { injectable } from 'tsyringe';

@injectable()
export class InboundMessageListenerFactory {
    public create<TMessageType extends MessageType>(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        replyParserService: IReplyParser<TMessageType>,
        onDisconnected$: Observable<void>,
    ): InboundMessageListener<TMessageType> {
        return new InboundMessageListener<TMessageType>(
            characteristicDataStream,
            replyParserService,
            onDisconnected$,
        );
    }
}
