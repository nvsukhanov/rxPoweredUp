import { injectable } from 'tsyringe';

import { RawMessage } from '../../types';
import { MessageType, PortInformationRequestType } from '../../constants';
import { IPortInformationRequestMessageFactory } from '../../features';

@injectable()
export class PortInformationRequestOutboundMessageFactory implements IPortInformationRequestMessageFactory {
  public createPortValueRequest(portId: number): RawMessage<MessageType.portInformationRequest> {
    return {
      header: {
        messageType: MessageType.portInformationRequest,
      },
      payload: Uint8Array.from([portId, PortInformationRequestType.portValue]),
    };
  }

  public createPortModeRequest(portId: number): RawMessage<MessageType.portInformationRequest> {
    return {
      header: {
        messageType: MessageType.portInformationRequest,
      },
      payload: Uint8Array.from([portId, PortInformationRequestType.modeInfo]),
    };
  }
}
