import { injectable } from 'tsyringe';

import { OutboundMessenger } from './outbound-messenger';
import { IMessageMiddleware, IOutboundMessenger, IOutboundMessengerFactory } from '../../hub';
import { PacketBuilder } from './packet-builder';

@injectable()
export class OutboundMessengerFactory implements IOutboundMessengerFactory {
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
