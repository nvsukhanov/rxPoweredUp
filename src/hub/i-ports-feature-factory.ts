import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from './i-outbound-messenger';
import { IPortsFeature } from './i-ports-feature';

export interface IPortsFeatureFactory {
    create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger
    ): IPortsFeature;
}

export const PORTS_FEATURE_FACTORY: InjectionToken<IPortsFeatureFactory> = Symbol('PORTS_FEATURE_FACTORY');
