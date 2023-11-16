import { container } from 'tsyringe';

import { IPortValueTransformer } from '../types';
import { HubType } from '../constants';
import { VoltageValueTransformerFactory } from './voltage-value-transformer-factory';
import { MotorAposValueTransformer } from './motor-apos-value-transformer';
import { MotorPosValueTransformer } from './motor-pos-value-transformer';
import { TemperatureValueTransformer } from './temperature-value-transformer';
import { TiltValueTransformer } from './tilt-value-transformer';
import { TiltData } from './tilt-data';

export class ValueTransformers {
    public static voltage(
        hubType: HubType
    ): IPortValueTransformer<number> {
        const factory = container.resolve(VoltageValueTransformerFactory);
        return factory.createForHubType(hubType);
    }

    public static get absolutePosition(): IPortValueTransformer<number> {
        return container.resolve(MotorAposValueTransformer);
    }

    public static get position(): IPortValueTransformer<number> {
        return container.resolve(MotorPosValueTransformer);
    }

    public static get temperature(): IPortValueTransformer<number> {
        return container.resolve(TemperatureValueTransformer);
    }

    public static get tilt(): IPortValueTransformer<TiltData> {
        return container.resolve(TiltValueTransformer);
    }
}
