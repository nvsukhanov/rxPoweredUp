import { container } from 'tsyringe';

import { HUB_SCANNER_ERROR_FACTORY } from './i-hub-scanner-error-factory';
import { HUB_CONNECTION_ERRORS_FACTORY, INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory, PREFIXED_CONSOLE_LOGGER_FACTORY } from '../hub';
import { HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, registerFeaturesServices } from '../features';
import { ConnectionErrorFactory } from '../errors';
import { PrefixedConsoleLoggerFactory } from '../logger';
import { registerMessagesServices } from '../messages';
import { registerPortValueTransformers } from '../port-value-transformers';

let registered = false;

export function registerServices(): void {
    if (registered) {
        return;
    }
    container.register(INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory);
    container.register(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, ConnectionErrorFactory);
    container.register(HUB_CONNECTION_ERRORS_FACTORY, ConnectionErrorFactory);
    container.register(HUB_SCANNER_ERROR_FACTORY, ConnectionErrorFactory);
    container.register(PREFIXED_CONSOLE_LOGGER_FACTORY, PrefixedConsoleLoggerFactory);

    registerPortValueTransformers();
    registerFeaturesServices(container);
    registerMessagesServices(container);
    registered = true;
}
