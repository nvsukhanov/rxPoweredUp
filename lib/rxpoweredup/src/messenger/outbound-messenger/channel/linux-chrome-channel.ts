import { RawMessage } from '../../../types';
import { MessageType } from '../../../constants';
import { PacketBuilder } from '../packet-builder';
import { IMessageMiddleware } from '../../../hub';
import { IChannel } from '../i-channel';

export class LinuxChromeChannel implements IChannel {
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly characteristic: BluetoothRemoteGATTCharacteristic,
    private readonly packetBuilder: PacketBuilder,
    private readonly messageMiddleware: ReadonlyArray<IMessageMiddleware>
  ) {}

  public sendMessage(message: RawMessage<MessageType>, beforeSend?: () => void): Promise<void> {
    const p = this.queue.then(() => {
      const resultingMessage = this.messageMiddleware.reduce((acc, middleware) => middleware.handle(acc), message);
      const packet = this.packetBuilder.buildPacket(resultingMessage);
      if (beforeSend) {
        beforeSend();
      }
      // writeValueWithoutResponse causes Chrome under linux to immediately lose connection to the small technic hub
      return this.characteristic.writeValueWithResponse(packet);
    });
    this.queue = p.catch(() => void 0);
    return p;
  }
}
