import { RawMessage } from '../../types/raw-message';
import { MessageType, PortInformationRequestType } from '../../constants';
import { injectable } from 'tsyringe';

@injectable()
export class PortInformationRequestOutboundMessageFactory {
    public createPortValueRequest(
        portId: number
    ): RawMessage<MessageType.portInformationRequest> {
        return {
            header: {
                messageType: MessageType.portInformationRequest,
            },
            payload: Uint8Array.from([
                portId,
                PortInformationRequestType.portValue
            ])
        };
    }

    public createPortModeRequest(
        portId: number
    ): RawMessage<MessageType.portInformationRequest> {
        return {
            header: {
                messageType: MessageType.portInformationRequest,
            },
            payload: Uint8Array.from([
                portId,
                PortInformationRequestType.modeInfo
            ])
        };
    }
}
