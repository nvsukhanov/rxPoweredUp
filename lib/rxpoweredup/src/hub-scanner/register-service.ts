import { DependencyContainer } from 'tsyringe';

import { HUB_SCANNER_ERROR_FACTORY } from './i-hub-scanner-error-factory';
import {
  HUB_CONNECTION_ERRORS_FACTORY,
  INBOUND_MESSAGE_LISTENER_FACTORY,
  InboundMessageListenerFactory,
  PREFIXED_CONSOLE_LOGGER_FACTORY,
} from '../hub';
import { HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, registerFeaturesServices } from '../features';
import { ErrorFactory } from '../errors';
import { PrefixedConsoleLoggerFactory } from '../logger';
import { registerProtocolServices } from '../protocol';
import { registerMessengerServices } from '../messenger';

let registered = false;

export function registerServices(container: DependencyContainer): void {
  if (registered) {
    return;
  }
  container.register(INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory);
  container.register(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, ErrorFactory);
  container.register(HUB_CONNECTION_ERRORS_FACTORY, ErrorFactory);
  container.register(HUB_SCANNER_ERROR_FACTORY, ErrorFactory);
  container.register(PREFIXED_CONSOLE_LOGGER_FACTORY, PrefixedConsoleLoggerFactory);

  registerProtocolServices(container);
  registerFeaturesServices(container);
  registerMessengerServices(container);
  registered = true;
}
