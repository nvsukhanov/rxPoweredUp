import { inject, injectable } from 'tsyringe';

import { Hub } from './hub';
import { BluetoothDeviceWithGatt } from '../types';
import { HUB_CONNECTION_ERRORS_FACTORY, IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { CHARACTERISTIC_DATA_STREAM_FACTORY, ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { IHub } from './i-hub';
import { IOutboundMessengerFactory, OUTBOUND_MESSAGE_FACTORY } from './i-outbound-messenger-factory';
import { HUB_PROPERTY_FEATURE_FACTORY, IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { IMotorsFeatureFactory, MOTORS_FEATURE_FACTORY } from './i-motors-feature-factory';
import { IPortsFeatureFactory, PORTS_FEATURE_FACTORY } from './i-ports-feature-factory';
import { IInboundMessageListenerFactory, INBOUND_MESSAGE_LISTENER_FACTORY } from './i-inbound-message-listener-factory';
import { GENERIC_ERRORS_REPLIES_PARSER } from './generic-errors-reply-parser';
import { MessageType } from '../constants';
import { IReplyParser } from './i-reply-parser';
import { IPrefixedConsoleLoggerFactory, PREFIXED_CONSOLE_LOGGER_FACTORY } from './i-prefixed-console-logger-factory';
import { HUB_CONFIG_DEFAULTS, HubConfig } from './hub-config';
import { HUB_ACTIONS_FEATURE_FACTORY, IHubActionsFeatureFactory } from './i-hub-actions-feature-factory';
import { ISensorsFeatureFactory, SENSORS_FEATURE_FACTORY } from './i-sensors-feature-factory';

@injectable()
export class HubFactory {
    constructor(
        @inject(HUB_CONNECTION_ERRORS_FACTORY) private readonly connectionErrorFactory: IHubConnectionErrorsFactory,
        @inject(OUTBOUND_MESSAGE_FACTORY) private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        @inject(HUB_PROPERTY_FEATURE_FACTORY) private readonly hubPropertiesFactory: IHubPropertiesFeatureFactory,
        @inject(PORTS_FEATURE_FACTORY) private readonly ioFeatureFactoryService: IPortsFeatureFactory,
        @inject(CHARACTERISTIC_DATA_STREAM_FACTORY) private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
        @inject(MOTORS_FEATURE_FACTORY) private readonly commandsFeatureFactory: IMotorsFeatureFactory,
        @inject(GENERIC_ERRORS_REPLIES_PARSER) private readonly genericErrorsReplyParser: IReplyParser<MessageType.genericError>,
        @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
        @inject(PREFIXED_CONSOLE_LOGGER_FACTORY) private readonly loggerFactory: IPrefixedConsoleLoggerFactory,
        @inject(HUB_ACTIONS_FEATURE_FACTORY) private readonly hubActionsFeatureFactory: IHubActionsFeatureFactory,
        @inject(SENSORS_FEATURE_FACTORY) private readonly sensorsFeatureFactory: ISensorsFeatureFactory
    ) {
    }

    public create(
        device: BluetoothDeviceWithGatt,
        config: Partial<HubConfig> = {}
    ): IHub {
        const combinedConfig = this.mergeConfigs(config);
        return new Hub(
            device,
            this.loggerFactory.createLogger(device.name ?? device.id, combinedConfig.logLevel),
            combinedConfig,
            this.connectionErrorFactory,
            this.outboundMessengerFactory,
            this.hubPropertiesFactory,
            this.ioFeatureFactoryService,
            this.characteristicsDataStreamFactory,
            this.commandsFeatureFactory,
            this.genericErrorsReplyParser,
            this.messageListenerFactory,
            this.hubActionsFeatureFactory,
            this.sensorsFeatureFactory
        );
    }

    private mergeConfigs(
        ...configs: Partial<HubConfig>[]
    ): HubConfig {
        return Object.assign({}, HUB_CONFIG_DEFAULTS, ...configs);
    }
}
