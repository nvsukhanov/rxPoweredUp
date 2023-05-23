import { container } from 'tsyringe';
import { Observable, map, switchMap } from 'rxjs';

import { HUB_SCANNER_ERROR_FACTORY, HubScannerFactory } from './hub-scanner';
import {
    CHARACTERISTIC_DATA_STREAM_FACTORY,
    GENERIC_ERRORS_REPLIES_PARSER,
    HUB_CONNECTION_ERRORS_FACTORY,
    HUB_PROPERTY_FEATURE_FACTORY,
    HubConfig,
    HubFactory,
    INBOUND_MESSAGE_LISTENER_FACTORY,
    InboundMessageListenerFactory,
    MOTORS_FEATURE_FACTORY,
    OUTBOUND_MESSAGE_FACTORY,
    PORTS_FEATURE_FACTORY,
    PREFIXED_CONSOLE_LOGGER_FACTORY
} from './hub';
import {
    AttachedIoReplyParser,
    CharacteristicDataStreamFactory,
    GenericErrorReplyParser,
    HubPropertiesOutboundMessageFactory,
    HubPropertiesReplyParser,
    OutboundMessengerFactory,
    PortInformationReplyParser,
    PortInformationRequestOutboundMessageFactory,
    PortInputFormatSetupSingleHandshakeReplyParser,
    PortInputFormatSetupSingleOutboundMessageFactory,
    PortModeInformationReplyParser,
    PortModeInformationRequestOutboundMessageFactory,
    PortOutputCommandFeedbackReplyParser,
    PortOutputCommandOutboundMessageFactory,
    PortValueAbsolutePositionReplyParser,
    PortValuePositionReplyParser,
    PortValueSpeedReplyParser
} from './messages';
import {
    ATTACHED_IO_REPLIES_PARSER,
    HUB_PROPERTIES_FEATURE_ERRORS_FACTORY,
    HUB_PROPERTIES_MESSAGE_FACTORY,
    HUB_PROPERTIES_REPLIES_PARSER,
    HubPropertiesFeatureFactory,
    MotorsFeatureFactory,
    PORT_INFORMATION_REPLY_PARSER,
    PORT_INFORMATION_REQUEST_MESSAGE_FACTORY,
    PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY,
    PORT_INPUT_FORMAT_SETUP_SINGLE_HANDSHAKE_REPLY_PARSER,
    PORT_MODE_INFORMATION_REPLY_PARSER,
    PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY,
    PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER,
    PORT_OUTPUT_COMMAND_MESSAGE_FACTORY,
    PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER,
    PORT_VALUE_POSITION_REPLY_PARSER,
    PORT_VALUE_SPEED_REPLY_PARSER,
    PortsFeatureFactory
} from './features';
import { ConnectionErrorFactory } from './errors';
import { PrefixedConsoleLoggerFactory } from './logger';
import { Hub } from './hub/hub';

container.register(OUTBOUND_MESSAGE_FACTORY, OutboundMessengerFactory);
container.register(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY, PortOutputCommandOutboundMessageFactory);
container.register(INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory);
container.register(PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER, PortOutputCommandFeedbackReplyParser);
container.register(HUB_PROPERTIES_REPLIES_PARSER, HubPropertiesReplyParser);
container.register(PORT_INFORMATION_REPLY_PARSER, PortInformationReplyParser);
container.register(ATTACHED_IO_REPLIES_PARSER, AttachedIoReplyParser);
container.register(PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER, PortValueAbsolutePositionReplyParser);
container.register(PORT_VALUE_SPEED_REPLY_PARSER, PortValueSpeedReplyParser);
container.register(PORT_VALUE_POSITION_REPLY_PARSER, PortValuePositionReplyParser);
container.register(PORT_MODE_INFORMATION_REPLY_PARSER, PortModeInformationReplyParser);
container.register(PORT_INPUT_FORMAT_SETUP_SINGLE_HANDSHAKE_REPLY_PARSER, PortInputFormatSetupSingleHandshakeReplyParser);
container.register(PORT_INFORMATION_REQUEST_MESSAGE_FACTORY, PortInformationRequestOutboundMessageFactory);
container.register(PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY, PortModeInformationRequestOutboundMessageFactory);
container.register(PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY, PortInputFormatSetupSingleOutboundMessageFactory);
container.register(HUB_PROPERTIES_MESSAGE_FACTORY, HubPropertiesOutboundMessageFactory);
container.register(HUB_PROPERTY_FEATURE_FACTORY, HubPropertiesFeatureFactory);
container.register(MOTORS_FEATURE_FACTORY, MotorsFeatureFactory);
container.register(PORTS_FEATURE_FACTORY, PortsFeatureFactory);
container.register(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, ConnectionErrorFactory);
container.register(HUB_CONNECTION_ERRORS_FACTORY, ConnectionErrorFactory);
container.register(HUB_SCANNER_ERROR_FACTORY, ConnectionErrorFactory);
container.register(CHARACTERISTIC_DATA_STREAM_FACTORY, CharacteristicDataStreamFactory);
container.register(GENERIC_ERRORS_REPLIES_PARSER, GenericErrorReplyParser);
container.register(PREFIXED_CONSOLE_LOGGER_FACTORY, PrefixedConsoleLoggerFactory);

export function connectHub(
    bluetooth: Bluetooth,
    config?: Partial<HubConfig>
): Observable<Hub> {
    const scannerFactory = container.resolve(HubScannerFactory).create(bluetooth);
    const hubFactory = container.resolve(HubFactory);
    return scannerFactory.discoverHub().pipe(
        map((device) => hubFactory.create(
            device,
            config
        )),
        switchMap((hub) => hub.connect().pipe(map(() => hub)))
    );
}
