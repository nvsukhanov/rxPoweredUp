import { HubActionsOutboundMessageFactory } from './hub-actions-outbound-message-factory';
import { HubActionType, MessageType } from '../../constants';

describe('HubActionsOutboundMessageFactory', () => {
    let subject: HubActionsOutboundMessageFactory;

    beforeEach(() => {
        subject = new HubActionsOutboundMessageFactory();
    });

    describe('createDisconnectMessage', () => {
        it('should return a disconnect message', () => {
            expect(subject.createDisconnectMessage()).toEqual({
                header: {
                    messageType: MessageType.action,
                },
                payload: Uint8Array.from([ HubActionType.disconnect ])
            });
        });
    });

    describe('createSwitchOffMessage', () => {
        it('should return a switchOff message', () => {
            expect(subject.createSwitchOffMessage()).toEqual({
                header: {
                    messageType: MessageType.action,
                },
                payload: Uint8Array.from([ HubActionType.switchOff ])
            });
        });
    });
});
