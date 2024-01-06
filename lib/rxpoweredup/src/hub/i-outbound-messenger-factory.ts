import { InjectionToken } from 'tsyringe';
import { Observable } from 'rxjs';

import { IOutboundMessenger } from './i-outbound-messenger';
import { GenericErrorInboundMessage, ILogger, RawMessage } from '../types';
import { MessageType } from '../constants';
import { OutboundMessengerConfig } from './outbound-messenger-config';

export interface IOutboundMessengerFactory {
    create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        genericErrorsStream: Observable<GenericErrorInboundMessage>,
        characteristic: BluetoothRemoteGATTCharacteristic,
        onDisconnected$: Observable<void>,
        logger: ILogger,
        config: OutboundMessengerConfig
    ): IOutboundMessenger;
}

export const OUTBOUND_MESSAGE_FACTORY: InjectionToken<IOutboundMessengerFactory> = Symbol('OUTBOUND_MESSAGE_FACTORY');
