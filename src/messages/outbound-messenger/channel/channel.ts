import { RawMessage } from '../../../types';
import { MessageType } from '../../../constants';
import { PacketBuilder } from '../packet-builder';
import { IMessageMiddleware } from '../../../hub';
import { IChannel } from '../i-channel';

export class Channel implements IChannel {
    constructor(
        private readonly characteristic: BluetoothRemoteGATTCharacteristic,
        private readonly packetBuilder: PacketBuilder,
        private readonly messageMiddleware: ReadonlyArray<IMessageMiddleware>,
    ) {
    }

    public sendMessage(
        message: RawMessage<MessageType>,
    ): Promise<void> {
        const resultingMessage = this.messageMiddleware.reduce((acc, middleware) => middleware.handle(acc), message);
        const packet = this.packetBuilder.buildPacket(resultingMessage);

        return this.characteristic.writeValueWithoutResponse(packet);
    }
}
