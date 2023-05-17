import { inject, injectable } from 'tsyringe';
import { NEVER, Observable } from 'rxjs';
import { Logger } from 'tslog';

import { Hub } from './hub';
import { BluetoothDeviceWithGatt, ILegoHubConfig, LEGO_HUB_CONFIG } from '../types';
import { HUB_CONNECTION_ERRORS_FACTORY, IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { CHARACTERISTIC_DATA_STREAM_FACTORY, ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { IMessageMiddleware } from './i-message-middleware';
import { IHub } from './i-hub';
import { IOutboundMessengerFactory, OUTBOUND_MESSAGE_FACTORY } from './i-outbound-messenger-factory';
import { HUB_PROPERTY_FEATURE_FACTORY, IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { COMMANDS_FEATURE_FACTORY, IPortOutputCommandsFeatureFactory } from './i-port-output-commands-feature-factory';
import { IPortsFeatureFactory, PORTS_FEATURE_FACTORY } from './i-ports-feature-factory';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from './i-inbound-message-listener-factory';
import { GENERIC_ERRORS_REPLIES_PARSER } from './generic-errors-reply-parser';
import { MessageType } from '../constants';
import { IReplyParser } from './i-reply-parser';

@injectable()
export class HubFactory {
    constructor(
        @inject(LEGO_HUB_CONFIG) private readonly config: ILegoHubConfig,
        @inject(HUB_CONNECTION_ERRORS_FACTORY) private readonly connectionErrorFactory: IHubConnectionErrorsFactory,
        @inject(OUTBOUND_MESSAGE_FACTORY) private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        @inject(HUB_PROPERTY_FEATURE_FACTORY) private readonly hubPropertiesFactory: IHubPropertiesFeatureFactory,
        @inject(PORTS_FEATURE_FACTORY) private readonly ioFeatureFactoryService: IPortsFeatureFactory,
        @inject(CHARACTERISTIC_DATA_STREAM_FACTORY) private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
        @inject(COMMANDS_FEATURE_FACTORY) private readonly commandsFeatureFactory: IPortOutputCommandsFeatureFactory,
        @inject(GENERIC_ERRORS_REPLIES_PARSER) private readonly genericErrorsReplyParser: IReplyParser<MessageType.genericError>,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
    ) {
    }

    public create(
        device: BluetoothDeviceWithGatt,
        incomingMessageMiddleware: IMessageMiddleware[] = [],
        outgoingMessageMiddleware: IMessageMiddleware[] = [],
        externalDisconnectEvents$: Observable<unknown> = NEVER
    ): IHub {
        return new Hub(
            device,
            new Logger({ name: device.name ?? device.id }),
            this.config,
            this.connectionErrorFactory,
            this.outboundMessengerFactory,
            this.hubPropertiesFactory,
            this.ioFeatureFactoryService,
            this.characteristicsDataStreamFactory,
            this.commandsFeatureFactory,
            this.genericErrorsReplyParser,
            this.messageListenerFactory,
            incomingMessageMiddleware,
            outgoingMessageMiddleware,
            externalDisconnectEvents$
        );
    }
}
