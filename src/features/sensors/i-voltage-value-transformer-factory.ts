import { InjectionToken } from 'tsyringe';

import { HubType } from '../../constants';
import { IPortValueTransformer } from '../../hub';

export interface IVoltageValueTransformerFactory {
    createForHubType(
        hubType: HubType
    ): IPortValueTransformer<number>;
}

export const VOLTAGE_VALUE_TRANSFORMER_FACTORY: InjectionToken<IVoltageValueTransformerFactory> = Symbol('VOLTAGE_VALUE_TRANSFORMER_FACTORY');
