import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { CommandsFeature } from './commands-feature';
import { InboundMessageListenerFactory, PortOutputCommandFeedbackReplyParser } from '../../messages';
import { ICommandsFeature } from './i-commands-feature';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IOutboundMessenger } from '../i-outbound-messenger';
import { IPortOutputCommandOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-port-output-command-outbound-message-factory';

@injectable()
export class CommandsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IPortOutputCommandOutboundMessageFactory,
        private readonly inboundMessageListenerFactory: InboundMessageListenerFactory,
        private readonly portOutputCommandFeedbackReplyParser: PortOutputCommandFeedbackReplyParser
    ) {
    }

    public createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        onDisconnected$: Observable<void>
    ): ICommandsFeature {
        return new CommandsFeature(
            messenger,
            this.messageFactory,
            this.inboundMessageListenerFactory.create(
                characteristicDataStream,
                this.portOutputCommandFeedbackReplyParser,
                onDisconnected$
            )
        );
    }
}
