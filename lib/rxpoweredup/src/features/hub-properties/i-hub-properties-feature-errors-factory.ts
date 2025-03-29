import { InjectionToken } from 'tsyringe';

import { HubProperty } from '../../constants';

export interface IHubPropertiesFeatureErrorsFactory {
  createInvalidPropertyValueError(property: HubProperty, value: number[] | number | string | string[]): Error;
}

export const HUB_PROPERTIES_FEATURE_ERRORS_FACTORY: InjectionToken<IHubPropertiesFeatureErrorsFactory> = Symbol(
  'HUB_PROPERTIES_FEATURE_ERRORS_FACTORY'
);
