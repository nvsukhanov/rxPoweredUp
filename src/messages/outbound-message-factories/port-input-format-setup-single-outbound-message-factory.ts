import { MessageType } from '../../constants';
import { ILegoHubConfig, LEGO_HUB_CONFIG, RawMessage } from '../../types';
import { numberToUint32LEArray } from '../../helpers';
import { inject, injectable } from 'tsyringe';

@injectable()
export class PortInputFormatSetupSingleOutboundMessageFactory {
    private readonly defaultUnsubscribePortPollingInterval = 0xFFFFFFFF; // UInt32 max

    constructor(
        @inject(LEGO_HUB_CONFIG) private config: ILegoHubConfig
    ) {
    }

    public createMessage(
        portId: number,
        mode: number,
        notificationsEnabled: boolean,
        deltaInterval: number = this.config.minimumAllowedIOPollInterval,
    ): RawMessage<MessageType.portInputFormatSetupSingle> {
        const pollInterval = notificationsEnabled
                             ? Math.max(deltaInterval, this.config.minimumAllowedIOPollInterval)
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
