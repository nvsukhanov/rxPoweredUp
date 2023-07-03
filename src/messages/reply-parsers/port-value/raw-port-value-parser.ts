import { injectable } from 'tsyringe';

import { IRawMotorPortValueParser } from '../../../features';
import { convertUint16ToSignedInt, convertUint32ToSignedInt, readNumberFromUint8LEArray } from '../../../helpers';

@injectable()
export class RawPortValueParser implements IRawMotorPortValueParser {
    public getAbsolutePosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint16ToSignedInt(rawValue);
    }

    public getPosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint32ToSignedInt(rawValue);
    }

    public getSpeed(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }
}
