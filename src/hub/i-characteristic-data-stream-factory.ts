import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { IMessageMiddleware } from './i-message-middleware';
import { RawMessage } from '../types';
import { MessageType } from '../constants';

export interface ICharacteristicDataStreamFactory {
    create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: IMessageMiddleware[]
    ): Observable<RawMessage<MessageType>>;
}

export const CHARACTERISTIC_DATA_STREAM_FACTORY: InjectionToken<ICharacteristicDataStreamFactory> = Symbol('ICharacteristicDataStreamFactory');
