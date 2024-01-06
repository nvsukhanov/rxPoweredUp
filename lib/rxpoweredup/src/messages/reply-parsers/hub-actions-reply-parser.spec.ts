import { HubActionsReplyParser } from './hub-actions-reply-parser';
import { RawMessage } from '../../types';
import { HubActionType, MessageType } from '../../constants';

describe('HubActionsReplyParser', () => {
    let subject: HubActionsReplyParser;

    beforeEach(() => {
        subject = new HubActionsReplyParser();
    });

    describe('parseMessage', () => {
        it('should return the message', () => {
            const mockMessage: RawMessage<MessageType.action> = {
                header: {
                    messageType: MessageType.action,
                },
                payload: Uint8Array.from([ 0x01 ]),
            };
            expect(subject.parseMessage(mockMessage)).toEqual({
                messageType: MessageType.action,
                actionType: HubActionType.switchOff,
            });
        });
    });
});
