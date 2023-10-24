import { injectable } from 'tsyringe';

import { TiltData } from '../../hub';
import { convertUint8ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';
import { ITiltValueTransformer } from '../../features';

@injectable()
export class TiltValueTransformer implements ITiltValueTransformer {
    public fromRawValue(
        rawValue: number[]
    ): TiltData {
        const yaw = readNumberFromUint8LEArray(rawValue.slice(0, 1));
        const pitch = readNumberFromUint8LEArray(rawValue.slice(2, 3));
        const roll = readNumberFromUint8LEArray(rawValue.slice(4, 5));
        return {
            roll: convertUint8ToSignedInt(roll),
            pitch: convertUint8ToSignedInt(pitch),
            yaw: convertUint8ToSignedInt(yaw)
        };
    }
}
