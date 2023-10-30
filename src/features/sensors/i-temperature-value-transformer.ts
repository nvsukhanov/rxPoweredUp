import { InjectionToken } from 'tsyringe';

export interface ITemperatureValueTransformer {
    fromRawValue(
        value: number[],
    ): number;

    toRawValue(
        value: number,
    ): number;
}

export const TEMPERATURE_VALUE_TRANSFORMER: InjectionToken<ITemperatureValueTransformer> = Symbol('TEMPERATURE_VALUE_TRANSFORMER');
