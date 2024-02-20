import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import type { GenericErrorInboundMessage, ILogger, RawMessage } from '../../types';
import { PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER } from '../../features';
import { MessageType } from '../../constants';
import type { IInboundMessageListenerFactory, IOutboundMessenger, IOutboundMessengerFactory, IReplyParser, OutboundMessengerConfig } from '../../hub';
import { INBOUND_MESSAGE_LISTENER_FACTORY, } from '../../hub';
import { OutboundMessenger } from './outbound-messenger';
import { TaskVisitorFactory } from './task-visitor';
import { TaskQueueFactoryFactory } from './queue';
import type { IChannelFactory } from './i-channel-factory';
import { CHANNEL_FACTORY } from './i-channel-factory';

@injectable()
export class OutboundMessengerFactory implements IOutboundMessengerFactory {
    constructor(
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER) private readonly feedbackIReplyParser: IReplyParser<MessageType.portOutputCommandFeedback>,
        @inject(CHANNEL_FACTORY) private readonly channelFactory: IChannelFactory,
        @inject(TaskQueueFactoryFactory) private readonly taskQueueFactoryFactory: TaskQueueFactoryFactory,
        @inject(TaskVisitorFactory) private readonly feedbackHandlerFactory: TaskVisitorFactory,
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
