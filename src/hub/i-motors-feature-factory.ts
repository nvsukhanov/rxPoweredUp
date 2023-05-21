import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IMotorsFeature } from './i-motors-feature';
import { IOutboundMessenger } from './i-outbound-messenger';
import { IPortValueProvider } from '../features';

export interface IMotorsFeatureFactory {
    createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        portValueProvider: IPortValueProvider
    ): IMotorsFeature;
}

export const MOTORS_FEATURE_FACTORY: InjectionToken<IMotorsFeatureFactory> = Symbol('COMMANDS_FEATURE_FACTORY');
