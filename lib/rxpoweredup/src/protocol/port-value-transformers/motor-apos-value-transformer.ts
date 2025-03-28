import { injectable } from 'tsyringe';

import { IPortValueTransformer } from '../../types';
import { convertUint16ToSignedInt, readNumberFromUint8LEArray } from '../../helpers';

@injectable()
export class MotorAposValueTransformer implements IPortValueTransformer<number> {
  public fromRawValue(value: number[]): number {
    return convertUint16ToSignedInt(readNumberFromUint8LEArray(value));
  }

  public toValueThreshold(value: number): number {
    return value;
  }
}
