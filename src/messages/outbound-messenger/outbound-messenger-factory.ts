import { Observable } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { RawMessage } from '../../types';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY, IReplyParser, PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER } from '../../features';
import { MessageType } from '../../constants';
import { IMessageMiddleware, IOutboundMessenger, IOutboundMessengerFactory } from '../../hub';
import { OutboundMessenger } from './outbound-messenger';
import { PacketBuilder } from './packet-builder';

@injectable()
export class OutboundMessengerFactory implements IOutboundMessengerFactory {
    constructor(
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER) private readonly feedbackIReplyParser: IReplyParser<MessageType.portOutputCommandFeedback>,
        private readonly packetBuilder: PacketBuilder,
    ) {
    }

    public create(
        characteristicDataStream: Observable<RawMessage<MessageType>>,
        characteristic: BluetoothRemoteGATTCharacteristic,
        messageMiddleware: ReadonlyArray<IMessageMiddleware>,
        onDisconnected$: Observable<void>
    ): IOutboundMessenger {
        const commandsFeedbackStream = this.messageListenerFactory.create(
            characteristicDataStream,
            this.feedbackIReplyParser,
            onDisconnected$
        );

        return new OutboundMessenger(
            commandsFeedbackStream,
            characteristic,
            this.packetBuilder,
            messageMiddleware
        );
    }
}
