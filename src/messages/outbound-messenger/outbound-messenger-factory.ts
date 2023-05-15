import { injectable } from 'tsyringe';

import { OutboundMessenger } from './outbound-messenger';
import { IMessageMiddleware } from '../../middleware';
import { IOutboundMessenger } from '../../features';
import { PacketBuilder } from './packet-builder';
import { IOutboundMessengerFactory } from '../../hub';

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
