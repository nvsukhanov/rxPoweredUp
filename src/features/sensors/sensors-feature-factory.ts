import { InjectionToken, inject, injectable } from 'tsyringe';

import { IPortValueTransformer, IRawPortValueProvider, ISensorsFeature, ISensorsFeatureFactory, TiltData } from '../../hub';
import { SensorsFeature } from './sensors-feature';
import { IVoltageValueTransformerFactory, VOLTAGE_VALUE_TRANSFORMER_FACTORY } from './i-voltage-value-transformer-factory';

export const TILT_VALUE_TRANSFORMER: InjectionToken<IPortValueTransformer<TiltData>> = Symbol('TILT_VALUE_TRANSFORMER');

export const TEMPERATURE_VALUE_TRANSFORMER: InjectionToken<IPortValueTransformer<number>> = Symbol('TEMPERATURE_VALUE_TRANSFORMER');

@injectable()
export class SensorsFeatureFactory implements ISensorsFeatureFactory {
    constructor(
        @inject(VOLTAGE_VALUE_TRANSFORMER_FACTORY) private readonly voltageValueTransformerFactory: IVoltageValueTransformerFactory,
        @inject(TILT_VALUE_TRANSFORMER) private readonly tiltValueTransformer: IPortValueTransformer<TiltData>,
        @inject(TEMPERATURE_VALUE_TRANSFORMER) private readonly temperatureValueTransformer: IPortValueTransformer<number>
    ) {
    }

    public createSensorsFeature(
        rawPortValueProvider: IRawPortValueProvider,
    ): ISensorsFeature {
        return new SensorsFeature(
            rawPortValueProvider,
            this.voltageValueTransformerFactory,
            this.tiltValueTransformer,
            this.temperatureValueTransformer
        );
    }
}
