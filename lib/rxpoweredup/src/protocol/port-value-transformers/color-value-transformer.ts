import { IPortValueTransformer } from '../../types';
import { ColorData } from './color-data';

export class ColorValueTransformer implements IPortValueTransformer<ColorData> {
    public fromRawValue(
        value: number[]
    ): ColorData {
        return {
            red: value[0],
            green: value[1],
            blue: value[2]
        };
    }

    public toValueThreshold(
        value: ColorData
    ): number {
        return Math.min(
            value.red,
            value.green,
            value.blue
        );
    }
}
