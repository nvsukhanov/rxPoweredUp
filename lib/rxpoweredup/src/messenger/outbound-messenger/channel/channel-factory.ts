import { inject, injectable } from 'tsyringe';

import { PacketBuilder } from '../packet-builder';
import { IChannel } from '../i-channel';
import { IMessageMiddleware } from '../../../hub';
import { Channel } from './channel';
import type { IChannelFactory } from '../i-channel-factory';

@injectable()
export class ChannelFactory implements IChannelFactory {
  constructor(@inject(PacketBuilder) private readonly packetBuilder: PacketBuilder) {}

  public createChannel(
    characteristic: BluetoothRemoteGATTCharacteristic,
    messageMiddleware: ReadonlyArray<IMessageMiddleware>
  ): IChannel {
    return new Channel(characteristic, this.packetBuilder, messageMiddleware);
  }
}
