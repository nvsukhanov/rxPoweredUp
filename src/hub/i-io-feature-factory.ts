import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from './i-outbound-messenger';
import { IIoFeature } from './i-io-feature';

export interface IIoFeatureFactory {
    create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger
    ): IIoFeature;
}

export const IO_FEATURE_FACTORY: InjectionToken<IIoFeatureFactory> = Symbol('IO_FEATURE_FACTORY');
