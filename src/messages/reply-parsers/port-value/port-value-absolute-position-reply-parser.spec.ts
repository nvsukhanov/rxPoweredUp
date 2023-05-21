import 'reflect-metadata';

import { RawMessage } from '../../../types';
import { MessageType, PortModeName } from '../../../constants';
import { PortValueAbsolutePositionReplyParser } from './port-value-absolute-position-reply-parser';

describe('PortValueAbsolutePositionReplyParser', () => {
    it('should parse message', () => {
        const message: RawMessage<MessageType.portValueSingle> = {
            header: {
                messageType: MessageType.portValueSingle,
            },
            payload: Uint8Array.from([ 10, 0xF1, 0xFF ])
        };
        const parser = new PortValueAbsolutePositionReplyParser();
        const result = parser.parseMessage(message);
        expect(result).toEqual({
            messageType: MessageType.portValueSingle,
            portId: 10,
            modeName: PortModeName.absolutePosition,
            absolutePosition: -15
        });
    });
});
