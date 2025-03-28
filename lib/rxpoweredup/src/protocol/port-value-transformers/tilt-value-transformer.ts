import { injectable } from 'tsyringe';

import { IPortValueTransformer } from '../../types';
import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';
import { TiltData } from './tilt-data';

@injectable()
export class TiltValueTransformer implements IPortValueTransformer<TiltData> {
  public fromRawValue(rawValue: number[]): TiltData {
    const yaw = readNumberFromUint8LEArray(rawValue.slice(0, 2));
    const pitch = readNumberFromUint8LEArray(rawValue.slice(2, 4));
    const roll = readNumberFromUint8LEArray(rawValue.slice(4, 6));
    return {
      roll: -convertUint16ToSignedInt(roll) % 180 | 0,
      pitch: convertUint16ToSignedInt(pitch) % 180 | 0,
      yaw: -convertUint16ToSignedInt(yaw) % 180 | 0,
    };
  }

  public toValueThreshold(value: TiltData): number {
    return Math.min(Math.abs(value.roll), Math.abs(value.pitch), Math.abs(value.yaw));
  }
}
