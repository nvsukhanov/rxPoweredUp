import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';
import { PortInputSetupSingleHandshakeInboundMessage, RawMessage } from '../../types';
import { readNumberFromUint8LEArray } from '../../helpers';

export class PortInputFormatSetupSingleHandshakeReplyParser implements IReplyParser<MessageType.portInputFormatSetupSingleHandshake> {
  public readonly messageType = MessageType.portInputFormatSetupSingleHandshake;

  public parseMessage(message: RawMessage<MessageType.portInputFormatSetupSingleHandshake>): PortInputSetupSingleHandshakeInboundMessage {
    return {
      messageType: MessageType.portInputFormatSetupSingleHandshake,
      portId: message.payload[0],
      modeId: message.payload[1],
      deltaInterval: readNumberFromUint8LEArray(message.payload.slice(2, 4)),
      notificationEnabled: message.payload[4] === 1,
    };
  }
}
