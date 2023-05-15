import { Observable } from 'rxjs';
import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from './i-outbound-messenger';
import { ICommandsFeature } from './i-commands-feature';

export interface ICommandsFeatureFactory {
    createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        onDisconnected$: Observable<void>
    ): ICommandsFeature;
}

export const COMMANDS_FEATURE_FACTORY: InjectionToken<ICommandsFeatureFactory> = Symbol('COMMANDS_FEATURE_FACTORY');
