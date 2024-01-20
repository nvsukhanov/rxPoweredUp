import { inject, injectable } from 'tsyringe';

import { PacketBuilder } from '../packet-builder';
import { IChannel } from '../i-channel';
import { IMessageMiddleware } from '../../../hub';
import { LinuxChromeChannel } from './linux-chrome-channel';

@injectable()
export class LinuxChromeChannelFactory {
    constructor(
        @inject(PacketBuilder) private readonly packetBuilder: PacketBuilder,
    ) {
    }

    public createChannel(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: ReadonlyArray<IMessageMiddleware>
    ): IChannel {
        return new LinuxChromeChannel(
            characteristic,
            this.packetBuilder,
            messageMiddleware
        );
    }
}
