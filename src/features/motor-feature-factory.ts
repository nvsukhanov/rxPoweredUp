import { MotorFeature } from './motor-feature';
import { IOutboundMessenger, PortOutputCommandOutboundMessageFactory } from '../messages';
import { injectable } from 'tsyringe';

@injectable()
export class MotorFeatureFactory {
    constructor(
        private readonly portOutputCommandOutboundMessageFactoryService: PortOutputCommandOutboundMessageFactory,
    ) {
    }

    public createMotorFeature(
        messenger: IOutboundMessenger
    ): MotorFeature {
        return new MotorFeature(
            messenger,
            this.portOutputCommandOutboundMessageFactoryService
        );
    }
}
