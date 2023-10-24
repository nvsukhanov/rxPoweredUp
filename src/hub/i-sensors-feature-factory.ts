import { InjectionToken } from 'tsyringe';

import { ISensorsFeature } from './i-sensors-feature';
import { IRawPortValueProvider } from './i-raw-port-value-provider';

export interface ISensorsFeatureFactory {
    createSensorsFeature(
        rawPortValueProvider: IRawPortValueProvider,
    ): ISensorsFeature;
}

export const SENSORS_FEATURE_FACTORY: InjectionToken<ISensorsFeatureFactory> = Symbol('SENSORS_FEATURE_FACTORY');
