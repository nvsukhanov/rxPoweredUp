import { InjectionToken } from 'tsyringe';

import { IMessageMiddleware } from './i-message-middleware';
import { IOutboundMessenger } from '../features';

export interface IOutboundMessengerFactory {
    create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: IMessageMiddleware[],
    ): IOutboundMessenger;
}

export const OUTBOUND_MESSAGE_FACTORY: InjectionToken<IOutboundMessengerFactory> = Symbol('OUTBOUND_MESSAGE_FACTORY');
