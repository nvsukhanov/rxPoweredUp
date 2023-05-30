import { Subject, Subscription, of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { HubActionsFeature } from './hub-actions-feature';
import { IOutboundMessenger } from '../../hub';
import { IHubActionsMessageFactory } from './i-hub-actions-message-factory';
import { HubActionInboundMessage, RawMessage } from '../../types';
import { HubActionType, MessageType } from '../../constants';

describe('HubActionsFeature', () => {
    let subject: HubActionsFeature;
    let messengerMock: IOutboundMessenger;
    let hubActionsMessageFactoryMock: IHubActionsMessageFactory;
    let inboundMessages: Subject<HubActionInboundMessage>;
    let subscriptions: Subscription[];

    beforeEach(() => {
        messengerMock = mock<IOutboundMessenger>();
        hubActionsMessageFactoryMock = mock<IHubActionsMessageFactory>();
        inboundMessages = new Subject<HubActionInboundMessage>();
        subscriptions = [];
        subject = new HubActionsFeature(
            instance(hubActionsMessageFactoryMock),
            instance(messengerMock),
            inboundMessages
        );
    });

    afterEach(() => {
        subscriptions.forEach((s) => s.unsubscribe());
        subscriptions = [];
    });

    describe('willDisconnect', () => {
        it('should emit when a willDisconnect message is received', () => {
            const subscriberMock = jest.fn();
            subscriptions.push(subject.willDisconnect.subscribe(subscriberMock));
            inboundMessages.next({ actionType: HubActionType.willDisconnect } as HubActionInboundMessage);
            expect(subscriberMock).toHaveBeenCalled();
            const lateMock = jest.fn();
            subscriptions.push(subject.willDisconnect.subscribe(lateMock));
            expect(lateMock).toHaveBeenCalled();
        });
    });

    describe('willSwitchOff', () => {
        it('should emit when a willSwitchOff message is received', () => {
            const subscriberMock = jest.fn();
            subscriptions.push(subject.willSwitchOff.subscribe(subscriberMock));
            inboundMessages.next({ actionType: HubActionType.willSwitchOff } as HubActionInboundMessage);
            expect(subscriberMock).toHaveBeenCalled();
            const lateMock = jest.fn();
            subscriptions.push(subject.willSwitchOff.subscribe(lateMock));
            expect(lateMock).toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('should send a disconnect message', (done) => {
            const mockMessage = Symbol() as unknown as RawMessage<MessageType.action>;
            when(hubActionsMessageFactoryMock.createDisconnectMessage()).thenReturn(mockMessage);
            when(messengerMock.sendWithoutResponse(mockMessage)).thenReturn(of(void 0));
            subscriptions.push(subject.disconnect().subscribe(done));
        });
    });

    describe('switchOff', () => {
        it('should send a switchOff message', (done) => {
            const mockMessage = Symbol() as unknown as RawMessage<MessageType.action>;
            when(hubActionsMessageFactoryMock.createSwitchOffMessage()).thenReturn(mockMessage);
            when(messengerMock.sendWithoutResponse(mockMessage)).thenReturn(of(void 0));
            subscriptions.push(subject.switchOff().subscribe(done));
        });
    });
});
