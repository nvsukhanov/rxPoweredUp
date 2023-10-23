import { injectable } from 'tsyringe';

import { IRawMotorPortValueParser } from '../../../features';
import { convertUint16ToSignedInt, convertUint32ToSignedInt, readNumberFromUint8LEArray } from '../../../helpers';

@injectable()
export class RawPortValueParser implements IRawMotorPortValueParser {
    public parseAbsolutePosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint16ToSignedInt(rawValue);
    }

    public parsePosition(
        rawPortValue: number[]
    ): number {
        const rawValue = readNumberFromUint8LEArray(rawPortValue);
        return convertUint32ToSignedInt(rawValue);
    }

    public parseSpeed(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }
}
