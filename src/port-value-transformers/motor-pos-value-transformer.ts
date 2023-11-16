import { injectable } from 'tsyringe';

import { IPortValueTransformer } from '../types';
import { convertUint32ToSignedInt, readNumberFromUint8LEArray } from '../helpers';

@injectable()
export class MotorPosValueTransformer implements IPortValueTransformer<number> {
    public fromRawValue(
        value: number[]
    ): number {
        return convertUint32ToSignedInt(
            readNumberFromUint8LEArray(value)
        );
    }

    public toValueThreshold(
        value: number
    ): number {
        return value;
    }
}
