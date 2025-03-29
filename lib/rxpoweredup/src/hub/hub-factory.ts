import { inject, injectable } from 'tsyringe';

import { Hub } from './hub';
import { BluetoothDeviceWithGatt } from '../types';
import type { IHubConnectionErrorsFactory } from './i-hub-connection-errors-factory';
import { HUB_CONNECTION_ERRORS_FACTORY } from './i-hub-connection-errors-factory';
import type { ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { CHARACTERISTIC_DATA_STREAM_FACTORY } from './i-characteristic-data-stream-factory';
import type { IOutboundMessengerFactory } from './i-outbound-messenger-factory';
import { OUTBOUND_MESSAGE_FACTORY } from './i-outbound-messenger-factory';
import type { IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { HUB_PROPERTY_FEATURE_FACTORY } from './i-hub-properties-feature-factory';
import type { IMotorsFeatureFactory } from './i-motors-feature-factory';
import { MOTORS_FEATURE_FACTORY } from './i-motors-feature-factory';
import type { IPortsFeatureFactory } from './i-ports-feature-factory';
import { PORTS_FEATURE_FACTORY } from './i-ports-feature-factory';
import type { IInboundMessageListenerFactory } from './i-inbound-message-listener-factory';
import { INBOUND_MESSAGE_LISTENER_FACTORY } from './i-inbound-message-listener-factory';
import { GENERIC_ERRORS_REPLIES_PARSER } from './generic-errors-reply-parser';
import { MessageType } from '../constants';
import type { IReplyParser } from './i-reply-parser';
import type { IPrefixedConsoleLoggerFactory } from './i-prefixed-console-logger-factory';
import { PREFIXED_CONSOLE_LOGGER_FACTORY } from './i-prefixed-console-logger-factory';
import { HUB_CONFIG_DEFAULTS, HubConfig } from './hub-config';
import type { IHubActionsFeatureFactory } from './i-hub-actions-feature-factory';
import { HUB_ACTIONS_FEATURE_FACTORY } from './i-hub-actions-feature-factory';
import type { IRgbLightFeatureFactory } from './i-rgb-light-feature-factory';
import { RGB_LIGHT_FEATURE_FACTORY } from './i-rgb-light-feature-factory';

@injectable()
export class HubFactory {
  constructor(
    @inject(HUB_CONNECTION_ERRORS_FACTORY) private readonly connectionErrorFactory: IHubConnectionErrorsFactory,
    @inject(OUTBOUND_MESSAGE_FACTORY) private readonly outboundMessengerFactory: IOutboundMessengerFactory,
    @inject(HUB_PROPERTY_FEATURE_FACTORY) private readonly hubPropertiesFactory: IHubPropertiesFeatureFactory,
    @inject(PORTS_FEATURE_FACTORY) private readonly ioFeatureFactoryService: IPortsFeatureFactory,
    @inject(CHARACTERISTIC_DATA_STREAM_FACTORY)
    private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
    @inject(MOTORS_FEATURE_FACTORY) private readonly motorsFeatureFactory: IMotorsFeatureFactory,
    @inject(RGB_LIGHT_FEATURE_FACTORY) private readonly ledFeatureFactory: IRgbLightFeatureFactory,
    @inject(GENERIC_ERRORS_REPLIES_PARSER)
    private readonly genericErrorsReplyParser: IReplyParser<MessageType.genericError>,
    @inject(INBOUND_MESSAGE_LISTENER_FACTORY) private readonly messageListenerFactory: IInboundMessageListenerFactory,
    @inject(PREFIXED_CONSOLE_LOGGER_FACTORY) private readonly loggerFactory: IPrefixedConsoleLoggerFactory,
    @inject(HUB_ACTIONS_FEATURE_FACTORY) private readonly hubActionsFeatureFactory: IHubActionsFeatureFactory
  ) {}

  public create(device: BluetoothDeviceWithGatt, config: Partial<HubConfig> = {}): Hub {
    const combinedConfig = this.mergeConfigs(config);
    return new Hub(
      device,
      config.logger ?? this.loggerFactory.createLogger(device.name ?? device.id, combinedConfig.logLevel),
      combinedConfig,
      this.connectionErrorFactory,
      this.outboundMessengerFactory,
      this.hubPropertiesFactory,
      this.ioFeatureFactoryService,
      this.characteristicsDataStreamFactory,
      this.motorsFeatureFactory,
      this.genericErrorsReplyParser,
      this.messageListenerFactory,
      this.hubActionsFeatureFactory,
      this.ledFeatureFactory
    );
  }

  private mergeConfigs(...configs: Partial<HubConfig>[]): HubConfig {
    return Object.assign({}, HUB_CONFIG_DEFAULTS, ...configs);
  }
}
