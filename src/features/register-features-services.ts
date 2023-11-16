import { DependencyContainer } from 'tsyringe';

import { HUB_ACTIONS_FEATURE_FACTORY, HUB_PROPERTY_FEATURE_FACTORY, MOTORS_FEATURE_FACTORY, PORTS_FEATURE_FACTORY } from '../hub';
import { HubPropertiesFeatureFactory } from './hub-properties';
import { MotorsFeatureFactory } from './motors';
import { PortsFeatureFactory } from './ports';
import { HubActionsFeatureFactory } from './hub-actions';

export function registerFeaturesServices(
    container: DependencyContainer
): void {
    container.register(HUB_PROPERTY_FEATURE_FACTORY, HubPropertiesFeatureFactory);
    container.register(MOTORS_FEATURE_FACTORY, MotorsFeatureFactory);
    container.register(PORTS_FEATURE_FACTORY, PortsFeatureFactory);
    container.register(HUB_ACTIONS_FEATURE_FACTORY, HubActionsFeatureFactory);
}
