import { inject, injectable } from 'tsyringe';

import { PacketBuilder } from '../packet-builder';
import { IChannel } from '../i-channel';
import { IMessageMiddleware } from '../../../hub';
import { Channel } from './channel';

@injectable()
export class ChannelFactory {
    constructor(
        @inject(PacketBuilder) private readonly packetBuilder: PacketBuilder,
    ) {
    }

    public createChannel(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: ReadonlyArray<IMessageMiddleware>
    ): IChannel {
        return new Channel(
            characteristic,
            this.packetBuilder,
            messageMiddleware
        );
    }
}
