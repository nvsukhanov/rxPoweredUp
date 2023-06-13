import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { MotorsFeature } from './motors-feature';
import { IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger } from '../../hub';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';
import { IRawPortValueProvider } from './i-raw-port-value-provider';
import { IRawMotorPortValueParser, RAW_MOTOR_PORT_VALUE_PARSER } from './i-raw-motor-port-value-parser';

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
        @inject(RAW_MOTOR_PORT_VALUE_PARSER) private readonly rawMotorPortValueParser: IRawMotorPortValueParser
    ) {
    }

    public createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        portValueProvider: IRawPortValueProvider
    ): IMotorsFeature {
        return new MotorsFeature(
            messenger,
            this.messageFactory,
            portValueProvider,
            this.rawMotorPortValueParser
        );
    }
}
