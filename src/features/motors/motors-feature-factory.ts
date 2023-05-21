import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { MotorsFeature } from './motors-feature';
import { IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger } from '../../hub';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';
import { IPortValueProvider } from './i-port-value-provider';

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
    ) {
    }

    public createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        portValueProvider: IPortValueProvider
    ): IMotorsFeature {
        return new MotorsFeature(
            messenger,
            this.messageFactory,
            portValueProvider
        );
    }
}
