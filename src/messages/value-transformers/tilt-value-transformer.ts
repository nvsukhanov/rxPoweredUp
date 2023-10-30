import { injectable } from 'tsyringe';

import { TiltData } from '../../hub';
import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';
import { ITiltValueTransformer } from '../../features';

@injectable()
export class TiltValueTransformer implements ITiltValueTransformer {
    public fromRawValue(
        rawValue: number[]
    ): TiltData {
        const yaw = readNumberFromUint8LEArray(rawValue.slice(0, 2));
        const pitch = readNumberFromUint8LEArray(rawValue.slice(2, 4));
        const roll = readNumberFromUint8LEArray(rawValue.slice(4, 6));
        return {
            roll: -convertUint16ToSignedInt(roll) % 180,
            pitch: convertUint16ToSignedInt(pitch) % 180,
            yaw: -convertUint16ToSignedInt(yaw) % 180
        };
    }
}
