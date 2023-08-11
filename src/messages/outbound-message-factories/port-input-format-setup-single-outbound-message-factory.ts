import { injectable } from 'tsyringe';

import { MessageType } from '../../constants';
import { RawMessage } from '../../types';
import { numberToUint32LEArray } from '../../helpers';
import { IPortInputFormatSetupMessageFactory } from '../../features';

@injectable()
export class PortInputFormatSetupSingleOutboundMessageFactory implements IPortInputFormatSetupMessageFactory {
    private readonly defaultUnsubscribePortPollingInterval = 0xFFFFFFFF; // UInt32 max

    private readonly minAllowedDeltaThreshold = 1;

    public createMessage(
        portId: number,
        mode: number,
        notificationsEnabled: boolean,
        deltaThreshold: number = 1
    ): RawMessage<MessageType.portInputFormatSetupSingle> {
        const pollInterval = notificationsEnabled
                             ? Math.max(deltaThreshold, this.minAllowedDeltaThreshold)
                             : this.defaultUnsubscribePortPollingInterval;
        return {
            header: {
                messageType: MessageType.portInputFormatSetupSingle,
            },
            payload: new Uint8Array([
                portId,
                mode,
                ...numberToUint32LEArray(pollInterval),
                +notificationsEnabled
            ])
        };
    }
}
