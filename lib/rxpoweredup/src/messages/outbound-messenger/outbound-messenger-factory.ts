import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { GenericErrorInboundMessage, ILogger, RawMessage } from '../../types';
import { PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER } from '../../features';
import { MessageType } from '../../constants';
import {
    IInboundMessageListenerFactory,
    INBOUND_MESSAGE_LISTENER_FACTORY,
    IOutboundMessenger,
    IOutboundMessengerFactory,
    IReplyParser,
    OutboundMessengerConfig
} from '../../hub';
import { OutboundMessenger } from './outbound-messenger';
import { ChannelFactory } from './channel';
import { TaskVisitorFactory } from './task-visitor';
import { TaskQueueFactoryFactory } from './queue/task-queue-factory-factory';

@injectable()
export class OutboundMessengerFactory implements IOutboundMessengerFactory {
    constructor(
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER) private readonly feedbackIReplyParser: IReplyParser<MessageType.portOutputCommandFeedback>,
        private readonly channelFactory: ChannelFactory,
        private readonly taskQueueFactoryFactory: TaskQueueFactoryFactory,
        private readonly feedbackHandlerFactory: TaskVisitorFactory,
    ) {
    }

    public create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        genericErrorsStream: Observable<GenericErrorInboundMessage>,
        characteristic: BluetoothRemoteGATTCharacteristic,
        onDisconnected$: Observable<void>,
        logger: ILogger,
        config: OutboundMessengerConfig
    ): IOutboundMessenger {
        const channel = this.channelFactory.createChannel(
            characteristic,
            config.outgoingMessageMiddleware
        );

        const commandsFeedbackStream = this.messageListenerFactory.create(
            characteristicDataStream,
            this.feedbackIReplyParser,
            onDisconnected$
        );

        const feedbackHandler = this.feedbackHandlerFactory.createFeedbackHandler(
            commandsFeedbackStream,
            logger
        );

        const taskQueueFactory = this.taskQueueFactoryFactory.create(
            channel,
            config.messageSendTimeout,
            config.maxMessageSendAttempts,
            config.initialMessageSendRetryDelayMs,
            logger,
            genericErrorsStream,
            feedbackHandler
        );

        return new OutboundMessenger(
            taskQueueFactory,
            logger
        );
    }
}
