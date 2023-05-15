import { inject, injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { CommandsFeature } from './commands-feature';
import { IOutboundMessenger, IPortOutputCommandsFeature, IPortOutputCommandsFeatureFactory } from '../../hub';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { IPortOutputCommandOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-port-output-command-outbound-message-factory';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from '../i-inbound-message-listener-factory';
import { PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER } from './port-output-command-feedback-reply-parser';
import { IReplyParser } from '../i-reply-parser';

@injectable()
export class CommandsFeatureFactory implements IPortOutputCommandsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IPortOutputCommandOutboundMessageFactory,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER) private readonly feedbackIReplyParser: IReplyParser<MessageType.portOutputCommandFeedback>
    ) {
    }

    public createCommandsFeature(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        messenger: IOutboundMessenger,
        onDisconnected$: Observable<void>
    ): IPortOutputCommandsFeature {
        const replies$ = this.messageListenerFactory.create(
            characteristicDataStream,
            this.feedbackIReplyParser,
            onDisconnected$
        );

        return new CommandsFeature(
            messenger,
            this.messageFactory,
            replies$
        );
    }
}
