import { InjectionToken } from 'tsyringe';

import { IRgbLightFeature } from './i-rgb-light-feature';
import { IOutboundMessenger } from './i-outbound-messenger';

export interface IRgbLightFeatureFactory {
  createFeature(messenger: IOutboundMessenger): IRgbLightFeature;
}

export const RGB_LIGHT_FEATURE_FACTORY: InjectionToken<IRgbLightFeatureFactory> = Symbol('RGB_LIGHT_FEATURE_FACTORY');
