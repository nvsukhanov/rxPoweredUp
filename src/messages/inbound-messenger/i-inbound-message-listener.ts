import { Observable } from 'rxjs';
import { InboundMessage } from '../../types';
import { MessageType } from '../../constants';

export interface IInboundMessageListener<TMessageType extends MessageType> {
    readonly replies$: Observable<InboundMessage & { messageType: TMessageType }>;
}
