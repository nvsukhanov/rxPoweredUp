import { inject, injectable } from 'tsyringe';

import { MotorsFeature } from './motors-feature';
import { HubConfig, IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger, IRawPortValueProvider } from '../../hub';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';
import { IRawMotorPortValueParser, RAW_MOTOR_PORT_VALUE_PARSER } from './i-raw-motor-port-value-parser';

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
        @inject(RAW_MOTOR_PORT_VALUE_PARSER) private readonly rawMotorPortValueParser: IRawMotorPortValueParser
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
            this.rawMotorPortValueParser,
            config
        );
    }
}
