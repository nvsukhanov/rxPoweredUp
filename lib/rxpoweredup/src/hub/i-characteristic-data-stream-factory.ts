import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { CharacteristicDataStreamConfig } from './characteristic-data-stream-config';

export interface ICharacteristicDataStreamFactory {
    create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        config: CharacteristicDataStreamConfig
    ): Observable<RawMessage<MessageType>>;
}

export const CHARACTERISTIC_DATA_STREAM_FACTORY: InjectionToken<ICharacteristicDataStreamFactory> = Symbol('ICharacteristicDataStreamFactory');
