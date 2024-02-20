import { InjectionToken } from 'tsyringe';

import { IChannel } from './i-channel';
import { IMessageMiddleware } from '../../hub';

export interface IChannelFactory {
    createChannel(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: ReadonlyArray<IMessageMiddleware>
    ): IChannel;
}

export const CHANNEL_FACTORY: InjectionToken<IChannelFactory> = Symbol('CHANNEL_FACTORY');
