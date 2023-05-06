import { MessageType, PortModeInformationType } from '../../constants';
import { RawMessage } from '../../types/raw-message';
import { injectable } from 'tsyringe';

@injectable()
export class PortModeInformationRequestOutboundMessageFactory {
    public createPortModeInformationRequest(
        portId: number,
        mode: number,
        modeInformationType: PortModeInformationType
    ): RawMessage<MessageType.portModeInformationRequest> {
        return {
            header: {
                messageType: MessageType.portModeInformationRequest,
            },
            payload: Uint8Array.from([
                portId,
                mode,
                modeInformationType
            ])
        };
    }
}
