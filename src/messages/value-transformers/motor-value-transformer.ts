import { injectable } from 'tsyringe';

import { IMotorValueTransformer } from '../../features';
import { convertUint16ToSignedInt, convertUint32ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';

@injectable()
export class MotorValueTransformer implements IMotorValueTransformer {
    public fromRawToAbsolutePosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint16ToSignedInt(rawValue);
    }

    public fromRawToPosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint32ToSignedInt(rawValue);
    }

    public fromRawToSpeed(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }
}
