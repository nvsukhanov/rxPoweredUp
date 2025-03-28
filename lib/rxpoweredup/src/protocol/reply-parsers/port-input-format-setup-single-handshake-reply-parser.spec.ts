import { RawMessage } from '../../types';
import { MessageType } from '../../constants';
import { PortInputFormatSetupSingleHandshakeReplyParser } from './port-input-format-setup-single-handshake-reply-parser';

describe('PortInputFormatSetupSingleHandshakeReplyParser', () => {
  it('should parse message', () => {
    const message: RawMessage<MessageType.portInputFormatSetupSingleHandshake> = {
      header: {
        messageType: MessageType.portInputFormatSetupSingleHandshake,
      },
      payload: Uint8Array.from([0x00, 0x02, 0xff, 0xff, 0xff, 0xff, 0x00]),
    };

    const result = new PortInputFormatSetupSingleHandshakeReplyParser().parseMessage(message);

    expect(result).toEqual({
      messageType: MessageType.portInputFormatSetupSingleHandshake,
      portId: 0,
      modeId: 2,
      deltaInterval: 65535,
      notificationEnabled: false,
    });
  });
});
