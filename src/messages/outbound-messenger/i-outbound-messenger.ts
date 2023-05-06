import { InboundMessage, RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { Observable } from 'rxjs';

export interface IOutboundMessenger {
    sendWithoutResponse(
        message: RawMessage<MessageType>
    ): Promise<void>;

    sendWithoutResponse$(
        message: RawMessage<MessageType>,
    ): Observable<void>;

    sendAndReceive$<TResponse extends InboundMessage>(
        message: RawMessage<MessageType>,
        listener$: Observable<TResponse>
    ): Observable<TResponse>;
}
