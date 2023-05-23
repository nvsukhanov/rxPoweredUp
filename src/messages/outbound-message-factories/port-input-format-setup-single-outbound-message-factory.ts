import { injectable } from 'tsyringe';

import { MessageType } from '../../constants';
import { RawMessage } from '../../types';
import { numberToUint32LEArray } from '../../helpers';
import { IPortInputFormatSetupMessageFactory } from '../../features';

@injectable()
export class PortInputFormatSetupSingleOutboundMessageFactory implements IPortInputFormatSetupMessageFactory {
    private readonly defaultUnsubscribePortPollingInterval = 0xFFFFFFFF; // UInt32 max

    private readonly minimumAllowedIOPollIntervalMs = 100;

    private readonly defaultIOPollIntervalMs = 500;

    public createMessage(
        portId: number,
        mode: number,
        notificationsEnabled: boolean,
        deltaInterval: number = this.defaultIOPollIntervalMs
    ): RawMessage<MessageType.portInputFormatSetupSingle> {
        const pollInterval = notificationsEnabled
                             ? Math.max(deltaInterval, this.minimumAllowedIOPollIntervalMs)
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
