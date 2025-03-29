import { IChannel } from './i-channel';
import { IMessageMiddleware } from '../../hub';

export interface IChannelFactory {
  createChannel(
    characteristic: BluetoothRemoteGATTCharacteristic,
    messageMiddleware: ReadonlyArray<IMessageMiddleware>
  ): IChannel;
}
