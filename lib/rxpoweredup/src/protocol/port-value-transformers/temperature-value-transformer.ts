import { injectable } from 'tsyringe';

import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';
import { IPortValueTransformer } from '../../types';

@injectable()
export class TemperatureValueTransformer implements IPortValueTransformer<number> {
    private readonly rawValueDivisor = 10;

    public fromRawValue(
        value: number[]
    ): number {
        return convertUint16ToSignedInt(
            readNumberFromUint8LEArray(value)
        ) / this.rawValueDivisor;
    }

    public toValueThreshold(
        value: number,
    ): number {
        return value * this.rawValueDivisor;
    }
}
