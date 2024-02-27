import { IMessageMiddleware } from './i-message-middleware';

/**
 * Configuration for the outbound messenger.
 * @public
 * @typedef {Object} OutboundMessengerConfig
 * @property {number} messageSendTimeout - The amount of time to wait for a message to be sent before timing out
 * @property {number} maxMessageSendAttempts - The maximum number of message send attempts before giving up
 * @property {number} initialMessageSendRetryDelayMs - The initial delay between retries when sending a message. Used as the base for exponential backoff
 * @property {IMessageMiddleware[]} outgoingMessageMiddleware - The middleware to apply to outgoing messages before sending them
 * @property {boolean} [useLinuxWorkaround] - Whether to use the workaround for breaking connections on Linux Chrome. Defaults to false.
 */
export type OutboundMessengerConfig = {
    readonly messageSendTimeout: number;
    readonly maxMessageSendAttempts: number;
    readonly initialMessageSendRetryDelayMs: number;
    readonly outgoingMessageMiddleware: IMessageMiddleware[];
    readonly useLinuxWorkaround?: boolean;
};
