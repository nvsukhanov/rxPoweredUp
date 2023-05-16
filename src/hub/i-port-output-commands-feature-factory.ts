import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IPortOutputCommandsFeature } from './i-port-output-commands-feature';
import { IOutboundMessenger } from './i-outbound-messenger';

export interface IPortOutputCommandsFeatureFactory {
    createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
    ): IPortOutputCommandsFeature;
}

export const COMMANDS_FEATURE_FACTORY: InjectionToken<IPortOutputCommandsFeatureFactory> = Symbol('COMMANDS_FEATURE_FACTORY');
