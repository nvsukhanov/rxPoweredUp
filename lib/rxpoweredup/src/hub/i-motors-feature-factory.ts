import { InjectionToken } from 'tsyringe';

import { IMotorsFeature } from './i-motors-feature';
import { IOutboundMessenger } from './i-outbound-messenger';
import { HubConfig } from './hub-config';

export interface IMotorsFeatureFactory {
  createMotorsFeature(messenger: IOutboundMessenger, config: HubConfig): IMotorsFeature;
}

export const MOTORS_FEATURE_FACTORY: InjectionToken<IMotorsFeatureFactory> = Symbol('COMMANDS_FEATURE_FACTORY');
