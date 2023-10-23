import { inject, injectable } from 'tsyringe';

import { MotorsFeature } from './motors-feature';
import { HubConfig, IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger, IRawPortValueProvider } from '../../hub';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';
import { IMotorValueTransformer, MOTOR_VALUE_TRANSFORMER } from './i-motor-value-transformer';

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
        @inject(MOTOR_VALUE_TRANSFORMER) private readonly motorValueTransformer: IMotorValueTransformer
    ) {
    }

    public createCommandsFeature(
        messenger: IOutboundMessenger,
        portValueProvider: IRawPortValueProvider,
        config: HubConfig
    ): IMotorsFeature {
        return new MotorsFeature(
            messenger,
            this.messageFactory,
            portValueProvider,
            this.motorValueTransformer,
            config
        );
    }
}
