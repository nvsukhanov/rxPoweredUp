import { instance, mock, verify, when } from 'ts-mockito';

import { Channel } from './channel';
import { IMessageMiddleware } from '../../../hub';
import { PacketBuilder } from '../packet-builder';
import { MessageType } from '../../../constants';
import { RawMessage } from '../../../types';

describe('Channel', () => {
    let characteristicMock: BluetoothRemoteGATTCharacteristic;
    let packetBuilderMock: PacketBuilder;
    let messageMiddlewareMock: IMessageMiddleware[];
    let subject: Channel;

    beforeEach(() => {
        characteristicMock = mock<BluetoothRemoteGATTCharacteristic>();
        packetBuilderMock = mock<PacketBuilder>();
        messageMiddlewareMock = [ mock<IMessageMiddleware>() ];
        subject = new Channel(
            instance(characteristicMock),
            instance(packetBuilderMock),
            messageMiddlewareMock.map(instance)
        );
    });

    it('should call packet builder with message', async () => {
        const message = {} as RawMessage<MessageType>;
        when(messageMiddlewareMock[0].handle(message)).thenReturn(message);
        await subject.sendMessage(message);
        verify(packetBuilderMock.buildPacket(message)).once();
    });

    it('should call characteristic with packet', async () => {
        const packet = new Uint8Array(0);
        const message = {} as RawMessage<MessageType>;
        when(packetBuilderMock.buildPacket(message)).thenReturn(packet);
        when(messageMiddlewareMock[0].handle(message)).thenReturn(message);
        await subject.sendMessage(message);
        verify(characteristicMock.writeValueWithoutResponse(packet)).once();
    });

    it('should call message middleware with message', async () => {
        const message = {} as RawMessage<MessageType>;
        await subject.sendMessage(message);
        verify(messageMiddlewareMock[0].handle(message)).once();
    });

    it('should not send message before the previous one is sent', (done) => {
        let isMessage2Sent = false;

        const message1 = {} as RawMessage<MessageType>;
        const packet1 = new Uint8Array(0);
        when(packetBuilderMock.buildPacket(message1)).thenReturn(packet1);
        when(messageMiddlewareMock[0].handle(message1)).thenReturn(message1);
        when(characteristicMock.writeValueWithoutResponse(packet1)).thenCall(() => Promise.resolve());

        const message2 = {} as RawMessage<MessageType>;
        const packet2 = new Uint8Array(0);
        when(packetBuilderMock.buildPacket(message2)).thenReturn(packet2);
        when(messageMiddlewareMock[0].handle(message2)).thenReturn(message2);
        when(characteristicMock.writeValueWithoutResponse(packet2)).thenCall(() => {
            isMessage2Sent = true;
            return Promise.resolve();
        });

        subject.sendMessage(message1).then(() => {
            expect(isMessage2Sent).toBe(false);
            done();
        });
        subject.sendMessage(message2);
    });
});
