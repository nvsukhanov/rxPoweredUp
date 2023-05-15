import { container } from 'tsyringe';
import { NEVER, Observable } from 'rxjs';

import { DEFAULT_CONFIG, LEGO_HUB_CONFIG } from './types';
import { HubScannerFactory } from './hub-scanner';
import { HubFactory, IHub, OUTBOUND_MESSAGE_FACTORY } from './hub';
import { IMessageMiddleware } from './middleware';
import { OutboundMessengerFactory, PortOutputCommandOutboundMessageFactory } from './messages';
import { PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './features';

container.register(LEGO_HUB_CONFIG, { useValue: DEFAULT_CONFIG });
container.register(OUTBOUND_MESSAGE_FACTORY, OutboundMessengerFactory);
container.register(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY, PortOutputCommandOutboundMessageFactory);

export async function connectHub(
    bluetooth: Bluetooth,
    incomingMessageMiddleware: IMessageMiddleware[] = [],
    outgoingMessageMiddleware: IMessageMiddleware[] = [],
    externalDisconnectEvents$: Observable<unknown> = NEVER
): Promise<IHub> {
    const factory = container.resolve(HubScannerFactory).create(bluetooth);
    const device = await factory.discoverHub();
    const hubFactory = container.resolve(HubFactory);
    const hub = await hubFactory.create(device, incomingMessageMiddleware, outgoingMessageMiddleware, externalDisconnectEvents$);
    await hub.connect();
    return hub;
}
