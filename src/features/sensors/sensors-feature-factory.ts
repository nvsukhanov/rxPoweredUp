import { inject, injectable } from 'tsyringe';

import { IRawPortValueProvider, ISensorsFeature, ISensorsFeatureFactory } from '../../hub';
import { SensorsFeature } from './sensors-feature';
import { IVoltageValueParser, VOLTAGE_VALUE_PARSER } from './i-voltage-value-parser';

@injectable()
export class SensorsFeatureFactory implements ISensorsFeatureFactory {
    constructor(
        @inject(VOLTAGE_VALUE_PARSER) private readonly voltageValueParser: IVoltageValueParser
    ) {
    }

    public createSensorsFeature(
        rawPortValueProvider: IRawPortValueProvider
    ): ISensorsFeature {
        return new SensorsFeature(
            rawPortValueProvider,
            this.voltageValueParser
        );
    }
}
