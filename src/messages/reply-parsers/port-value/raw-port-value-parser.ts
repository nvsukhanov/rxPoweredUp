import { injectable } from 'tsyringe';

import { IRawMotorPortValueParser } from '../../../features';

@injectable()
export class RawPortValueParser implements IRawMotorPortValueParser {
    public getAbsolutePosition(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }

    public getPosition(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }

    public getSpeed(
        rawPortValue: number[]
    ): number {
        return rawPortValue[0];
    }
}
