import { inject, injectable } from 'tsyringe';

import { IRawPortValueProvider, ISensorsFeature, ISensorsFeatureFactory } from '../../hub';
import { SensorsFeature } from './sensors-feature';
import { IVoltageValueTransformer, VOLTAGE_VALUE_TRANSFORMER } from './i-voltage-value-transformer';

@injectable()
export class SensorsFeatureFactory implements ISensorsFeatureFactory {
    constructor(
        @inject(VOLTAGE_VALUE_TRANSFORMER) private readonly voltageValueTransformer: IVoltageValueTransformer
    ) {
    }

    public createSensorsFeature(
        rawPortValueProvider: IRawPortValueProvider
    ): ISensorsFeature {
        return new SensorsFeature(
            rawPortValueProvider,
            this.voltageValueTransformer
        );
    }
}
