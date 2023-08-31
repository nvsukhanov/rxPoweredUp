import { LogLevel } from '../constants';
import { OutboundMessengerConfig } from './outbound-messenger-config';
import { CharacteristicDataStreamConfig } from './characteristic-data-stream-config';

/**
 * Configuration for the hub.
 * @public
 * @typedef {Object} HubConfig
 * @property {number} maxGattConnectRetries - The maximum number of times to retry connecting to the GATT server before giving up
 * @property {LogLevel} logLevel - The log level to use
 */
export type HubConfig = {
    readonly maxGattConnectRetries: number;
    readonly logLevel: LogLevel;
    readonly hubConnectionTimeoutMs: number;
} & OutboundMessengerConfig & CharacteristicDataStreamConfig;

export const HUB_CONFIG_DEFAULTS: HubConfig = {
    maxGattConnectRetries: 5,
    incomingMessageMiddleware: [],
    outgoingMessageMiddleware: [],
    logLevel: LogLevel.Warning,
    messageSendTimeout: 300,
    maxMessageSendAttempts: 5,
    initialMessageSendRetryDelayMs: 50,
    hubConnectionTimeoutMs: 5000,
};
