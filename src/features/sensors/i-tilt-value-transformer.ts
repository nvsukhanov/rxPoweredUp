import { InjectionToken } from 'tsyringe';

import { TiltData } from '../../hub';

export interface ITiltValueTransformer {
    fromRawValue(rawValue: number[]): TiltData
}

export const TILT_VALUE_TRANSFORMER: InjectionToken<ITiltValueTransformer> = Symbol('TILT_VALUE_TRANSFORMER');
