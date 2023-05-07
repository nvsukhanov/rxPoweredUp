import { injectable } from 'tsyringe';
import { Observable } from 'rxjs';

import { CommandsFeature } from './commands-feature';
import { IOutboundMessenger, InboundMessageListenerFactory, OutputCommandOutboundMessageFactory, PortOutputCommandFeedbackReplyParser } from '../../messages';
import { ICommandsFeature } from './i-commands-feature';
import { RawMessage } from '../../types';
import { MessageType } from '../../constants';

@injectable()
export class CommandsFeatureFactory {
    constructor(
        private readonly portOutputCommandOutboundMessageFactoryService: OutputCommandOutboundMessageFactory,
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
            this.portOutputCommandOutboundMessageFactoryService,
            this.inboundMessageListenerFactory.create(
                characteristicDataStream,
                this.portOutputCommandFeedbackReplyParser,
                onDisconnected$
            )
        );
    }
}
