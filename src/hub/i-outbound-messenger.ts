import { Observable } from 'rxjs';

import { RawMessage } from '../types';
import { MessageType } from '../constants';

export interface IOutboundMessenger {
    sendWithResponse<TResponse>(
        message: RawMessage<MessageType>,
        responseStream: Observable<TResponse>,
    ): Observable<TResponse>

    sendWithoutResponse(
        message: RawMessage<MessageType>,
    ): Observable<void>
}

