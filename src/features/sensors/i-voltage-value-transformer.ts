import { InjectionToken } from 'tsyringe';

import { HubType } from '../../constants';

export interface IVoltageValueTransformer {
    fromRawValue(
        value: number[],
        hubType: HubType
    ): number;

    toRawValue(
        value: number,
        hubType: HubType
    ): number;
}

export const VOLTAGE_VALUE_TRANSFORMER: InjectionToken<IVoltageValueTransformer> = Symbol('VOLTAGE_VALUE_TRANSFORMER');
