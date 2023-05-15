import { injectable } from 'tsyringe';

import { OutboundMessenger } from './outbound-messenger';
import { IMessageMiddleware, IOutboundMessengerFactory } from '../../hub';
import { IOutboundMessenger } from '../../features';
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
