import { injectable } from 'tsyringe';

import { MotorFeature } from './motor-feature';
import { IOutboundMessenger, PortOutputCommandOutboundMessageFactory } from '../../messages';
import { IMotorFeature } from './i-motor-feature';

@injectable()
export class MotorFeatureFactory {
    constructor(
        private readonly portOutputCommandOutboundMessageFactoryService: PortOutputCommandOutboundMessageFactory,
    ) {
    }

    public createMotorFeature(
        messenger: IOutboundMessenger
    ): IMotorFeature {
        return new MotorFeature(
            messenger,
            this.portOutputCommandOutboundMessageFactoryService
        );
    }
}
