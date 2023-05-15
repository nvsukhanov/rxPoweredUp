import { container } from 'tsyringe';
import { NEVER, Observable } from 'rxjs';

import { DEFAULT_CONFIG, LEGO_HUB_CONFIG } from './types';
import { HubScannerFactory } from './hub-scanner';
import { HubFactory, IHub, OUTBOUND_MESSAGE_FACTORY } from './hub';
import { IMessageMiddleware } from './middleware';
import {
    AttachedIoReplyParser,
    HubPropertiesReplyParser,
    OutboundMessengerFactory,
    PortInformationReplyParser,
    PortModeInformationReplyParser,
    PortOutputCommandFeedbackReplyParser,
    PortOutputCommandOutboundMessageFactory,
    PortValueAbsolutePositionReplyParser,
    PortValueSpeedReplyParser
} from './messages';
import {
    ATTACHED_IO_REPLIES_PARSER,
    HUB_PROPERTIES_REPLIES_PARSER,
    INBOUND_MESSAGE_LISTENER_FACTORY,
    InboundMessageListenerFactory,
    PORT_INFORMATION_REPLY_PARSER,
    PORT_MODE_INFORMATION_REPLY_PARSER,
    PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER,
    PORT_OUTPUT_COMMAND_MESSAGE_FACTORY,
    PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER,
    PORT_VALUE_SPEED_REPLY_PARSER
} from './features';

container.register(LEGO_HUB_CONFIG, { useValue: DEFAULT_CONFIG });
container.register(OUTBOUND_MESSAGE_FACTORY, OutboundMessengerFactory);
container.register(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY, PortOutputCommandOutboundMessageFactory);
container.register(INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory);
container.register(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER, PortOutputCommandFeedbackReplyParser);
container.register(HUB_PROPERTIES_REPLIES_PARSER, HubPropertiesReplyParser);
container.register(PORT_INFORMATION_REPLY_PARSER, PortInformationReplyParser);
container.register(ATTACHED_IO_REPLIES_PARSER, AttachedIoReplyParser);
container.register(PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER, PortValueAbsolutePositionReplyParser);
container.register(PORT_VALUE_SPEED_REPLY_PARSER, PortValueSpeedReplyParser);
container.register(PORT_MODE_INFORMATION_REPLY_PARSER, PortModeInformationReplyParser);

export async function connectHub(
    bluetooth: Bluetooth,
    incomingMessageMiddleware: IMessageMiddleware[] = [],
    outgoingMessageMiddleware: IMessageMiddleware[] = [],
    externalDisconnectEvents$: Observable<unknown> = NEVER
): Promise<IHub> {
    const factory = container.resolve(HubScannerFactory).create(bluetooth);
    const device = await factory.discoverHub();
    const hubFactory = container.resolve(HubFactory);
    const hub = await hubFactory.create(device, incomingMessageMiddleware, outgoingMessageMiddleware, externalDisconnectEvents$);
    await hub.connect();
    return hub;
}
