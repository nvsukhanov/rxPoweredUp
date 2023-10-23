import { InjectionToken } from 'tsyringe';

import { HubType } from '../../constants';

export interface IVoltageValueParser {
    fromRawValue(
        value: number[],
        hubType: HubType
    ): number;

    toRawValue(
        value: number,
        hubType: HubType
    ): number;
}

export const VOLTAGE_VALUE_PARSER: InjectionToken<IVoltageValueParser> = Symbol('VOLTAGE_VALUE_PARSER');
