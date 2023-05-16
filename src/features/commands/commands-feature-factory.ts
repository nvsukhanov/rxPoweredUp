import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { CommandsFeature } from './commands-feature';
import { IOutboundMessenger, IPortOutputCommandsFeature, IPortOutputCommandsFeatureFactory } from '../../hub';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IPortOutputCommandOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-port-output-command-outbound-message-factory';

@injectable()
export class CommandsFeatureFactory implements IPortOutputCommandsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IPortOutputCommandOutboundMessageFactory,
    ) {
    }

    public createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
    ): IPortOutputCommandsFeature {
        return new CommandsFeature(
            messenger,
            this.messageFactory,
        );
    }
}
