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
});
