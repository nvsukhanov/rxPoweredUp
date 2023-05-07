import { injectable } from 'tsyringe';

import { OutboundMessenger } from './outbound-messenger';
import { IMessageMiddleware } from '../../middleware';
import { IOutboundMessenger } from './i-outbound-messenger';
import { PacketBuilder } from './packet-builder';

@injectable()
export class OutboundMessengerFactory {
    constructor(
        private readonly packerBuilder: PacketBuilder,
    ) {
    }

    public create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: IMessageMiddleware[],
    ): IOutboundMessenger {
        return new OutboundMessenger(
            characteristic,
            this.packerBuilder,
            messageMiddleware,
        );
    }
}
