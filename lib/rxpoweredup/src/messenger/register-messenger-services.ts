import { DependencyContainer } from 'tsyringe';

import { CHARACTERISTIC_DATA_STREAM_FACTORY, OUTBOUND_MESSAGE_FACTORY } from '../hub';
import { CharacteristicDataStreamFactory } from './characteristic-data-stream-factory';
import { OutboundMessengerFactory } from './outbound-messenger';
import { ChannelFactory, LinuxChromeChannelFactory } from './outbound-messenger/channel';

export function registerMessengerServices(container: DependencyContainer): void {
  container.registerSingleton(LinuxChromeChannelFactory);
  container.registerSingleton(ChannelFactory);
  container.register(CHARACTERISTIC_DATA_STREAM_FACTORY, CharacteristicDataStreamFactory);
  container.register(OUTBOUND_MESSAGE_FACTORY, OutboundMessengerFactory);
}
