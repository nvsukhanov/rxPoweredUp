import { injectable } from 'tsyringe';

import { HubType } from '../../constants';
import { IPortValueTransformer } from '../../hub';
import { VoltageValueTransformer } from './voltage-value-transformer';
import { IVoltageValueTransformerFactory } from '../../features';

@injectable()
export class VoltageValueTransformerFactory implements IVoltageValueTransformerFactory {
    private readonly fallbackRawValueDivisor: number = 400;

    // Empirically determined voltage coefficients for different hub types.
    private readonly rawValueDivisors: { [k in HubType]?: number } = {
        [HubType.TwoPortHub]: 380,
        [HubType.FourPortHub]: 420,
        [HubType.TwoPortHandset]: 500
    };

    public createForHubType(
        hubType: HubType
    ): IPortValueTransformer<number> {
        return new VoltageValueTransformer(
            this.getRawValueDivisor(hubType)
        );
    }

    private getRawValueDivisor(
        hubType: HubType
    ): number {
        const voltageCoefficient = this.rawValueDivisors[hubType];
        return voltageCoefficient === undefined ? this.fallbackRawValueDivisor : voltageCoefficient;
    }
}
