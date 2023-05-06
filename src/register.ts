import { container } from 'tsyringe';
import { DEFAULT_CONFIG, LEGO_HUB_CONFIG } from './types';
import { HubScannerFactory } from './hub-scanner';
import { HubFactory, IHub } from './hub';
import { IMessageMiddleware } from './middleware';
import { NEVER, Observable } from 'rxjs';

container.register(LEGO_HUB_CONFIG, { useValue: DEFAULT_CONFIG });

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
