import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from './i-outbound-messenger';
import { IPortOutputCommandsFeature } from './i-port-output-commands-feature';

export interface IPortOutputCommandsFeatureFactory {
    createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        onDisconnected$: Observable<void>
    ): IPortOutputCommandsFeature;
}

export const COMMANDS_FEATURE_FACTORY: InjectionToken<IPortOutputCommandsFeatureFactory> = Symbol('COMMANDS_FEATURE_FACTORY');
