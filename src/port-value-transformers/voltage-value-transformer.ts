import { readNumberFromUint8LEArray } from '../helpers';
import { IPortValueTransformer } from '../types';

export class VoltageValueTransformer implements IPortValueTransformer<number> {
    constructor(
        private readonly rawValueDivisor: number
    ) {
    }

    public fromRawValue(
        value: number[],
    ): number {
        const rawVoltageValue = readNumberFromUint8LEArray(value);
        return rawVoltageValue / this.rawValueDivisor;
    }

    public toValueThreshold(
        value: number,
    ): number {
        return value * this.rawValueDivisor;
    }
}
