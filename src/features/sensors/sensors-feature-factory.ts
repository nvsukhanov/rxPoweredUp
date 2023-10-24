import { inject, injectable } from 'tsyringe';

import { IRawPortValueProvider, ISensorsFeature, ISensorsFeatureFactory } from '../../hub';
import { SensorsFeature } from './sensors-feature';
import { IVoltageValueTransformer, VOLTAGE_VALUE_TRANSFORMER } from './i-voltage-value-transformer';
import { ITiltValueTransformer, TILT_VALUE_TRANSFORMER } from './i-tilt-value-transformer';

@injectable()
export class SensorsFeatureFactory implements ISensorsFeatureFactory {
    constructor(
        @inject(VOLTAGE_VALUE_TRANSFORMER) private readonly voltageValueTransformer: IVoltageValueTransformer,
        @inject(TILT_VALUE_TRANSFORMER) private readonly tiltValueTransformer: ITiltValueTransformer,
    ) {
    }

    public createSensorsFeature(
        rawPortValueProvider: IRawPortValueProvider,
    ): ISensorsFeature {
        return new SensorsFeature(
            rawPortValueProvider,
            this.voltageValueTransformer,
            this.tiltValueTransformer
        );
    }
}
