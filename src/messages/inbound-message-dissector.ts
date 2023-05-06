import { MessageType } from '../constants';
import { RawMessage } from '../types/raw-message';
import { injectable } from 'tsyringe';

@injectable()
export class InboundMessageDissector {
    private readonly messageTypeLength = 1;

    private readonly shortHeaderLength = 1;

    private readonly longHeaderLength = 2;

    private readonly hubIdLength = 1; // https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#common-message-header

    public dissect(
        rawMessage: Uint8Array
    ): RawMessage<MessageType> {
        const messageType = rawMessage[this.getMessageTypeOffset(rawMessage)] as MessageType;
        return {
            header: {
                messageType
            },
            payload: this.getPayload(rawMessage)
        };
    }

    private getPayload(message: Uint8Array): Uint8Array {
        return message.slice(
            this.getMessagePayloadOffset(message)
        );
    }

    private getMessageTypeOffset(message: Uint8Array): number {
        const headerLength = message[0] >= 127 ? this.longHeaderLength : this.shortHeaderLength;
        return headerLength + this.hubIdLength;
    }

    private getMessagePayloadOffset(message: Uint8Array): number {
        return this.getMessageTypeOffset(message) + this.messageTypeLength;
    }
}
