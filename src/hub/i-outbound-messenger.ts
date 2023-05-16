import { Observable } from 'rxjs';

import { IDisposable, RawMessage } from '../types';
import { MessageType, OutboundMessageTypes } from '../constants';
import { PortCommandExecutionStatus } from './i-port-output-commands-feature';

export interface IOutboundMessenger extends IDisposable {
    sendWithResponse<TResponse>(
        message: RawMessage<OutboundMessageTypes>,
        responseStream: Observable<TResponse>,
    ): Observable<TResponse>

    sendWithoutResponse(
        message: RawMessage<OutboundMessageTypes>,
    ): Observable<void>

    sendPortOutputCommand(
        message: RawMessage<MessageType.portOutputCommand>,
    ): Observable<PortCommandExecutionStatus>;
}

