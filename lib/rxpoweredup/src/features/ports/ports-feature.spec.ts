import { Observable, Subject, Subscription, of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { PortsFeature } from './ports-feature';
import {
    AttachedIOInboundMessage,
    PortInputSetupSingleHandshakeInboundMessage,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortValueInboundMessage,
    RawMessage
} from '../../types';
import { IPortInformationRequestMessageFactory } from './i-port-information-request-message-factory';
import { IPortModeInformationRequestMessageFactory } from './i-port-mode-information-request-message-factory';
import { IPortInputFormatSetupMessageFactory } from '../i-port-input-format-setup-message-factory';
import { IVirtualPortSetupMessageFactory } from './i-virtual-port-setup-message-factory';
import { IOutboundMessenger } from '../../hub';
import { MessageType } from '../../constants';

describe('PortsFeature', () => {
    let subject: PortsFeature;
    let portModeReplies: Subject<PortModeInboundMessage>;
    let attachedIoReplies: Subject<AttachedIOInboundMessage>;
    let attachedIoCachedReplies: Subject<AttachedIOInboundMessage>;
    let portModeInformationReplies: Subject<PortModeInformationInboundMessage>;
    let portValueSetupSingleHandshakeRepliesMock: Observable<PortInputSetupSingleHandshakeInboundMessage>;
    let portValueSetupSingleHandshakeReplies: Subject<PortInputSetupSingleHandshakeInboundMessage>;
    let portInformationRequestMessageFactoryMock: IPortInformationRequestMessageFactory;
    let rawPortValueReplies: Subject<PortValueInboundMessage>;
    let portModeInformationMessageFactoryMock: IPortModeInformationRequestMessageFactory;
    let portInputFormatSetupMessageFactoryMock: IPortInputFormatSetupMessageFactory;
    let virtualPortSetupMessageFactoryMock: IVirtualPortSetupMessageFactory;
    let messengerMock: IOutboundMessenger;

    let subscription: Subscription;

    beforeEach(() => {
        subscription = new Subscription();

        portModeReplies = new Subject<PortModeInboundMessage>();
        attachedIoReplies = new Subject<AttachedIOInboundMessage>();
        attachedIoCachedReplies = new Subject<AttachedIOInboundMessage>();
        portModeInformationReplies = new Subject<PortModeInformationInboundMessage>();
        portValueSetupSingleHandshakeReplies = new Subject<PortInputSetupSingleHandshakeInboundMessage>();

        portValueSetupSingleHandshakeRepliesMock = mock(Observable<PortInputSetupSingleHandshakeInboundMessage>);
        when(portValueSetupSingleHandshakeRepliesMock.pipe(anything(), anything())).thenReturn(portValueSetupSingleHandshakeReplies);

        portInformationRequestMessageFactoryMock = mock<IPortInformationRequestMessageFactory>();
        rawPortValueReplies = new Subject<PortValueInboundMessage>();
        portModeInformationMessageFactoryMock = mock<IPortModeInformationRequestMessageFactory>();
        portInputFormatSetupMessageFactoryMock = mock<IPortInputFormatSetupMessageFactory>();
        virtualPortSetupMessageFactoryMock = mock<IVirtualPortSetupMessageFactory>();
        messengerMock = mock<IOutboundMessenger>();

        subject = new PortsFeature(
            portModeReplies,
            attachedIoReplies,
            attachedIoCachedReplies,
            portModeInformationReplies,
            instance(portValueSetupSingleHandshakeRepliesMock),
            instance(portInformationRequestMessageFactoryMock),
            rawPortValueReplies,
            instance(portModeInformationMessageFactoryMock),
            instance(portInputFormatSetupMessageFactoryMock),
            instance(virtualPortSetupMessageFactoryMock),
            instance(messengerMock)
        );
    });

    afterEach(() => {
        subscription.unsubscribe();
    });

    describe('rawPortValueChanges', () => {
        let portId: number;
        let modeId: number;
        let deltaThreshold: number;
        let handshakeMessage: RawMessage<MessageType.portInputFormatSetupSingle>;
        let handshakeReply: PortInputSetupSingleHandshakeInboundMessage;
        let disableNotificationMessage: RawMessage<MessageType.portInputFormatSetupSingle>;
        let disableNotificationReply: PortInputSetupSingleHandshakeInboundMessage;

        beforeEach(() => {
            portId = Symbol() as unknown as number;
            modeId = Symbol() as unknown as number;
            deltaThreshold = Symbol() as unknown as number;

            handshakeMessage = Symbol() as unknown as RawMessage<MessageType.portInputFormatSetupSingle>;
            when(portInputFormatSetupMessageFactoryMock.createMessage(portId, modeId, true, deltaThreshold)).thenReturn(handshakeMessage);

            disableNotificationMessage = Symbol() as unknown as RawMessage<MessageType.portInputFormatSetupSingle>;
            when(portInputFormatSetupMessageFactoryMock.createMessage(portId, modeId, false)).thenReturn(disableNotificationMessage);

            handshakeReply = Symbol() as unknown as PortInputSetupSingleHandshakeInboundMessage;
            disableNotificationReply = Symbol() as unknown as PortInputSetupSingleHandshakeInboundMessage;

            when(
                messengerMock.sendWithResponse(deepEqual({ message: handshakeMessage, reply: portValueSetupSingleHandshakeReplies }))
            ).thenReturn(of(handshakeReply));
            when(
                messengerMock.sendWithResponse(deepEqual({ message: disableNotificationMessage, reply: portValueSetupSingleHandshakeReplies }))
            ).thenReturn(of(disableNotificationReply));
        });

        it('should send handshake message', () => {
            subscription.add(subject.portValueChanges(portId, modeId, deltaThreshold).subscribe());

            verify(messengerMock.sendWithResponse(deepEqual({ message: handshakeMessage, reply: portValueSetupSingleHandshakeReplies }))).once();
        });

        it('should send disable notification message when last subscriber unsubscribes', () => {
            const sub = subject.portValueChanges(portId, modeId, deltaThreshold).subscribe();
            subscription.add(sub);
            verify(messengerMock.sendWithResponse(deepEqual({ message: disableNotificationMessage, reply: portValueSetupSingleHandshakeReplies }))).never();
            sub.unsubscribe();
            verify(messengerMock.sendWithResponse(deepEqual({ message: disableNotificationMessage, reply: portValueSetupSingleHandshakeReplies }))).once();
        });

        it('should not send disable notification message when disposed', () => {
            const sub = subject.portValueChanges(portId, modeId, deltaThreshold).subscribe();
            subscription.add(sub);
            subject.dispose();
            sub.unsubscribe();
            verify(messengerMock.sendWithResponse(deepEqual({ message: disableNotificationMessage, reply: portValueSetupSingleHandshakeReplies }))).never();
        });
    });
});
