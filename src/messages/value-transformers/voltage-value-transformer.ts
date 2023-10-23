import { IVoltageValueTransformer } from '../../features';
import { HubType } from '../../constants';
import { readNumberFromUint8LEArray } from '../../helpers';

export class VoltageValueTransformer implements IVoltageValueTransformer {
    private readonly fallbackVoltageCoefficient: number = 400;

    // Empirically determined voltage coefficients for different hub types.
    private readonly voltageCoefficients: { [k in HubType]?: number } = {
        [HubType.TwoPortHub]: 380,
        [HubType.FourPortHub]: 420,
        [HubType.TwoPortHandset]: 500
    };

    public fromRawValue(
        value: number[],
        hubType: HubType
    ): number {
        const rawVoltageValue = readNumberFromUint8LEArray(value);
        return rawVoltageValue / this.getVoltageCoefficient(hubType);
    }

    public toRawValue(
        value: number,
        hubType: HubType
    ): number {
        return value * this.getVoltageCoefficient(hubType);
    }

    private getVoltageCoefficient(
        hubType: HubType
    ): number {
        const voltageCoefficient = this.voltageCoefficients[hubType];
        return voltageCoefficient === undefined ? this.fallbackVoltageCoefficient : voltageCoefficient;
    }
}
