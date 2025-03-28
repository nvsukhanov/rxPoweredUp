import { LogLevel, PortOperationStartupInformation } from '../constants';
import { OutboundMessengerConfig } from './outbound-messenger-config';
import { CharacteristicDataStreamConfig } from './characteristic-data-stream-config';
import { ILogger } from '../types';

/**
 * Configuration for the hub.
 * @public
 * @typedef {Object} HubConfig
 * @property {number} maxGattConnectRetries - The maximum number of times to retry connecting to the GATT server before giving up
 * @property {LogLevel} logLevel - The log level to use
 * @property {number} hubConnectionTimeoutMs - The amount of time to wait for a connection to the hub before timing out
 * @property {PortOperationStartupInformation} defaultBufferMode - The default buffer mode to use when sending port output commands
 * @property {boolean} [useLinuxWorkaround] - Whether to use the workaround for breaking connections on Linux Chrome
 */
export type HubConfig = {
  readonly maxGattConnectRetries: number;
  readonly logLevel: LogLevel;
  readonly logger?: ILogger;
  readonly hubConnectionTimeoutMs: number;
  readonly defaultBufferMode: PortOperationStartupInformation;
} & OutboundMessengerConfig &
  CharacteristicDataStreamConfig;

export const HUB_CONFIG_DEFAULTS: HubConfig = {
  defaultBufferMode: PortOperationStartupInformation.bufferIfNecessary,
  maxGattConnectRetries: 5,
  incomingMessageMiddleware: [],
  outgoingMessageMiddleware: [],
  logLevel: LogLevel.Warning,
  messageSendTimeout: 300,
  maxMessageSendAttempts: 5,
  initialMessageSendRetryDelayMs: 50,
  hubConnectionTimeoutMs: 5000,
};
