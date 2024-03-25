import { Observable } from 'rxjs';

import { IDisposable, LastOfTuple, RawMessage } from '../types';
import { MessageType, OutboundMessageTypes } from '../constants';
import { PortCommandExecutionStatus } from './i-motors-feature';

export type WithResponseSequenceItem<TResponse> = {
    readonly message: RawMessage<OutboundMessageTypes>;
    readonly reply: Observable<TResponse>;
};

export interface IOutboundMessenger extends IDisposable {
    sendWithResponse<
        TSequenceItems extends [ ...Array<WithResponseSequenceItem<unknown>>, WithResponseSequenceItem<unknown> ],
        TResult extends LastOfTuple<TSequenceItems> extends WithResponseSequenceItem<infer R> ? R : never
    >(
        ...sequenceItems: TSequenceItems
    ): Observable<TResult>;

    sendWithoutResponse(
        message: RawMessage<OutboundMessageTypes>,
    ): Observable<void>;

    sendPortOutputCommand(
        message: RawMessage<MessageType.portOutputCommand>,
    ): Observable<PortCommandExecutionStatus>;
}
