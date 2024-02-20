import { DependencyContainer } from 'tsyringe';

import { CHARACTERISTIC_DATA_STREAM_FACTORY, OUTBOUND_MESSAGE_FACTORY } from '../hub';
import { CharacteristicDataStreamFactory } from './characteristic-data-stream-factory';
import { CHANNEL_FACTORY, OutboundMessengerFactory } from './outbound-messenger';
import { ChannelFactory, LinuxChromeChannelFactory } from './outbound-messenger/channel';

export function registerMessengerServices(
    container: DependencyContainer,
    useLinuxWorkaround: boolean
): void {

    container.register(CHARACTERISTIC_DATA_STREAM_FACTORY, CharacteristicDataStreamFactory);
    container.register(OUTBOUND_MESSAGE_FACTORY, OutboundMessengerFactory);

    if (useLinuxWorkaround) {
        container.register(CHANNEL_FACTORY, LinuxChromeChannelFactory);
    } else {
        container.register(CHANNEL_FACTORY, ChannelFactory);
    }
}
