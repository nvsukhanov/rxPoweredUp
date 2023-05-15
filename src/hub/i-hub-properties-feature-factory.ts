import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from '../features';
import { ILogger } from '../i-logger';
import { IHubPropertiesFeature } from './i-hub-properties-feature';

export interface IHubPropertiesFeatureFactory {
    create(
        advertisingName: string,
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        onHubDisconnected: Observable<void>,
        messenger: IOutboundMessenger,
        logger: ILogger
    ): IHubPropertiesFeature;
}

export const HUB_PROPERTY_FEATURE_FACTORY: InjectionToken<IHubPropertiesFeatureFactory> = Symbol('HUB_PROPERTY_FEATURE_FACTORY');
