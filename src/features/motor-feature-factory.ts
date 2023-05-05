import { MotorFeature } from './motor-feature';
import { OutboundMessenger, PortOutputCommandOutboundMessageFactory } from '../messages';
import { injectable } from 'tsyringe';

@injectable()
export class MotorFeatureFactory {
    constructor(
        private readonly portOutputCommandOutboundMessageFactoryService: PortOutputCommandOutboundMessageFactory,
    ) {
    }

    public createMotorFeature(
        messenger: OutboundMessenger
    ): MotorFeature {
        return new MotorFeature(
            messenger,
            this.portOutputCommandOutboundMessageFactoryService
        );
    }
}
