import { InjectionToken } from 'tsyringe';
import { Observable } from 'rxjs';

import { IHubActionsFeature } from './i-hub-actions-feature';
import { RawMessage } from '../types';
import { MessageType } from '../constants';
import { IOutboundMessenger } from './i-outbound-messenger';

export interface IHubActionsFeatureFactory {
  create(characteristicDataStream: Observable<RawMessage<MessageType>>, messenger: IOutboundMessenger, onDisconnected$: Observable<void>): IHubActionsFeature;
}

export const HUB_ACTIONS_FEATURE_FACTORY: InjectionToken<IHubActionsFeatureFactory> = Symbol('HUB_ACTIONS_FEATURE_FACTORY');
