import { inject, injectable } from 'tsyringe';

import { PacketBuilder } from '../packet-builder';
import { IChannel } from '../i-channel';
import { IMessageMiddleware } from '../../../hub';
import { LinuxChromeChannel } from './linux-chrome-channel';
import type { IChannelFactory } from '../i-channel-factory';

@injectable()
export class LinuxChromeChannelFactory implements IChannelFactory {
  constructor(@inject(PacketBuilder) private readonly packetBuilder: PacketBuilder) {}

  public createChannel(
    characteristic: BluetoothRemoteGATTCharacteristic,
    messageMiddleware: ReadonlyArray<IMessageMiddleware>
  ): IChannel {
    return new LinuxChromeChannel(characteristic, this.packetBuilder, messageMiddleware);
  }
}
