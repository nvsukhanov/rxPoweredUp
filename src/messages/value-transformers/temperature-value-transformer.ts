import { injectable } from 'tsyringe';

import { ITemperatureValueTransformer } from '../../features';
import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';

@injectable()
export class TemperatureValueTransformer implements ITemperatureValueTransformer {
    private readonly temperatureCoefficient = 0.1;

    public fromRawValue(
        value: number[]
    ): number {
        return convertUint16ToSignedInt(
            readNumberFromUint8LEArray(value)
        ) * this.temperatureCoefficient;
    }

    public toRawValue(
        value: number,
    ): number {
        return value / this.temperatureCoefficient;
    }
}
