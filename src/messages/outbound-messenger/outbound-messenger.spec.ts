import 'reflect-metadata';
import { NEVER, Subject } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { OutboundMessenger } from './outbound-messenger';
import { PortOutputCommandFeedbackInboundMessage, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { PacketBuilder } from './packet-builder';
import { MessageType } from '../../constants';
import { concatUint8Arrays } from '../../helpers';
import { PortOutputCommandFeedbackReplyParser } from '../reply-parsers';
import { PortCommandExecutionStatus } from '../../hub';

function createPortOutputCommandMessage(id: number): RawPortOutputCommandMessage {
    return {
        id,
        header: {
            messageType: MessageType.portOutputCommand
        },
        portId: 0,
        payload: Uint8Array.from([])
    } as unknown as RawPortOutputCommandMessage;
}

function convertFeedbackReply(portId: number, payload: Uint8Array): PortOutputCommandFeedbackInboundMessage {
    const message: RawMessage<MessageType.portOutputCommandFeedback> = {
        header: {
            messageType: MessageType.portOutputCommandFeedback
        },
        payload: concatUint8Arrays(Uint8Array.from([ portId ]), payload)
    };
    const parser = new PortOutputCommandFeedbackReplyParser();
    return parser.parseMessage(message);
}

describe('OutboundMessenger', () => {
    let subject: OutboundMessenger;
    let portOutputCommandFeedbackStream: Subject<PortOutputCommandFeedbackInboundMessage>;
    let characteristicMock: BluetoothRemoteGATTCharacteristic;
    let packetBuilderMock: PacketBuilder;

    beforeEach(() => {
        portOutputCommandFeedbackStream = new Subject();
        characteristicMock = mock<BluetoothRemoteGATTCharacteristic>();
        packetBuilderMock = mock(PacketBuilder);

        subject = new OutboundMessenger(
            portOutputCommandFeedbackStream,
            NEVER,
            instance(characteristicMock),
            instance(packetBuilderMock),
            []
        );
    });

    it('should be created', () => {
        expect(subject).toBeTruthy();
    });

    /*
     * Test for halting issue:
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x01
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x05
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x0e
     * Then messenger halts and does not send any more messages.
     */
    it('should not halt when 0x0e feedback is received', (done) => {
        const firstReplies: PortCommandExecutionStatus[] = [];
        const secondReplies: PortCommandExecutionStatus[] = [];
        const thirdReplies: PortCommandExecutionStatus[] = [];
        const fourthReplies: PortCommandExecutionStatus[] = [];

        const firstMessage = createPortOutputCommandMessage(1);
        const secondMessage = createPortOutputCommandMessage(2);
        const thirdMessage = createPortOutputCommandMessage(3);
        const fourthMessage = createPortOutputCommandMessage(4);

        const firstPacket = Symbol() as unknown as Uint8Array;
        const secondPacket = Symbol() as unknown as Uint8Array;
        const thirdPacket = Symbol() as unknown as Uint8Array;
        const fourthPacket = Symbol() as unknown as Uint8Array;

        const firstResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(firstMessage.portId, Uint8Array.from([ 0x01 ])));
        const secondResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(secondMessage.portId, Uint8Array.from([ 0x05 ])));
        const thirdResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(thirdMessage.portId, Uint8Array.from([ 0x0e ])));
        const fourthResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(fourthMessage.portId, Uint8Array.from([ 0x01 ])));
        const fifthResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(thirdMessage.portId, Uint8Array.from([ 0x10 ])));

        when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
        when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);
        when(packetBuilderMock.buildPacket(thirdMessage)).thenReturn(thirdPacket);
        when(packetBuilderMock.buildPacket(fourthMessage)).thenReturn(fourthPacket);

        when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenResolve();
        when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenResolve();

        when(characteristicMock.writeValueWithoutResponse(thirdPacket)).thenResolve();

        when(characteristicMock.writeValueWithoutResponse(fourthPacket)).thenResolve();

        subject.sendPortOutputCommand(firstMessage).subscribe((v) => firstReplies.push(v));
        firstResponseHandle();
        subject.sendPortOutputCommand(secondMessage).subscribe((v) => secondReplies.push(v));
        secondResponseHandle();
        subject.sendPortOutputCommand(thirdMessage).subscribe((v) => thirdReplies.push(v));
        thirdResponseHandle();
        subject.sendPortOutputCommand(fourthMessage).subscribe({
            next: (v) => fourthReplies.push(v),
            complete: () => {
                expect(firstReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.discarded ]);
                expect(secondReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.discarded ]);
                expect(thirdReplies).toEqual([ PortCommandExecutionStatus.completed ]);
                expect(fourthReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.completed ]);
                done();
            }
        });
        fourthResponseHandle();
        fifthResponseHandle();
    });
});
