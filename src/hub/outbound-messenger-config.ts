import { IMessageMiddleware } from './i-message-middleware';

/**
 * Configuration for the outbound messenger.
 * @public
 * @typedef {Object} OutboundMessengerConfig
 * @property {number} messageSendTimeout - The amount of time to wait for a message to be sent before timing out
 * @property {number} maxMessageSendRetries - The maximum number of times to retry sending a message before giving up
 * @property {IMessageMiddleware[]} outgoingMessageMiddleware - The middleware to apply to outgoing messages before sending them
 */
export type OutboundMessengerConfig = {
    readonly messageSendTimeout: number;
    readonly maxMessageSendRetries: number;
    readonly outgoingMessageMiddleware: IMessageMiddleware[];
}
