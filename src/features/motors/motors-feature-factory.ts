import { inject, injectable } from 'tsyringe';

import { MotorsFeature } from './motors-feature';
import { HubConfig, IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger } from '../../hub';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
    ) {
    }

    public createMotorsFeature(
        messenger: IOutboundMessenger,
        config: HubConfig
    ): IMotorsFeature {
        return new MotorsFeature(
            messenger,
            this.messageFactory,
            config
        );
    }
}
