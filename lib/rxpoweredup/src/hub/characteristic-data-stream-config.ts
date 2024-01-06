import { IMessageMiddleware } from './i-message-middleware';

/**
 * Configuration for the characteristic data stream.
 * @public
 * @typedef {Object} CharacteristicDataStreamConfig
 * @property {IMessageMiddleware[]} incomingMessageMiddleware - The middleware to apply to incoming messages after receiving them
 */
export type CharacteristicDataStreamConfig = {
    readonly incomingMessageMiddleware: IMessageMiddleware[];
}
