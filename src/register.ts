import { container } from 'tsyringe';
import { Observable, map, switchMap } from 'rxjs';

import { HUB_SCANNER_ERROR_FACTORY, HubScannerFactory } from './hub-scanner';
import {
    HUB_CONNECTION_ERRORS_FACTORY,
    HubConfig,
    HubFactory,
    IHub,
    INBOUND_MESSAGE_LISTENER_FACTORY,
    InboundMessageListenerFactory,
    PREFIXED_CONSOLE_LOGGER_FACTORY
} from './hub';
import { HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, registerFeaturesServices } from './features';
import { ConnectionErrorFactory } from './errors';
import { PrefixedConsoleLoggerFactory } from './logger';
import { registerMessagesServices } from './messages';
import { registerPortValueTransformers } from './port-value-transformers';

container.register(INBOUND_MESSAGE_LISTENER_FACTORY, InboundMessageListenerFactory);
container.register(HUB_PROPERTIES_FEATURE_ERRORS_FACTORY, ConnectionErrorFactory);
container.register(HUB_CONNECTION_ERRORS_FACTORY, ConnectionErrorFactory);
container.register(HUB_SCANNER_ERROR_FACTORY, ConnectionErrorFactory);
container.register(PREFIXED_CONSOLE_LOGGER_FACTORY, PrefixedConsoleLoggerFactory);

registerPortValueTransformers();
registerFeaturesServices(container);
registerMessagesServices(container);

export function connectHub(
    bluetooth: Bluetooth,
    config?: Partial<HubConfig>
): Observable<IHub> {
    const scannerFactory = container.resolve(HubScannerFactory).create(bluetooth);
    const hubFactory = container.resolve(HubFactory);
    return scannerFactory.discoverHub().pipe(
        map((device) => hubFactory.create(
            device,
            config
        )),
        switchMap((hub) => hub.connect().pipe(map(() => hub)))
    );
}
