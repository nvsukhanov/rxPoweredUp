import { injectable } from 'tsyringe';

import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { concatUintArraysToUint8Array } from '../../helpers';

@injectable()
export class PacketBuilder {
  private readonly messageTypeLength = 1;

  public buildPacket(message: RawMessage<MessageType>): Uint8Array {
    const header = this.composeHeader(message);
    return concatUintArraysToUint8Array(header, message.payload);
  }

  private composeHeader(message: RawMessage<MessageType>): Uint8Array {
    if (this.getPayloadLengthPaddedWithMessageType(message) < 127) {
      return Uint8Array.from([message.payload.byteLength, 0x00, message.header.messageType]);
    } else {
      throw new Error('Long messages are not supported yet'); // TODO: add support
    }
  }

  private getPayloadLengthPaddedWithMessageType(message: RawMessage<MessageType>): number {
    return message.payload.length + this.messageTypeLength;
  }
}
