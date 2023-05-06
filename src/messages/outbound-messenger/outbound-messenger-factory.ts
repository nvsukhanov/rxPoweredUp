import { OutboundMessenger } from './outbound-messenger';
import { IMessageMiddleware } from '../../middleware';
import { ILegoHubConfig, LEGO_HUB_CONFIG } from '../../types';
import { inject, injectable } from 'tsyringe';
import { ILogger } from '../../logging';
import { IOutboundMessenger } from './i-outbound-messenger';

@injectable()
export class OutboundMessengerFactory {
    constructor(
        @inject(LEGO_HUB_CONFIG) private readonly config: ILegoHubConfig
    ) {
    }

    public create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: IMessageMiddleware[],
        logger: ILogger
    ): IOutboundMessenger {
        return new OutboundMessenger(
            characteristic,
            messageMiddleware,
            logger,
            this.config
        );
    }
}
