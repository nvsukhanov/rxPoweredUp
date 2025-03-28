import { injectable } from 'tsyringe';

import { MessageType, PortModeInformationType } from '../../constants';
import { RawMessage } from '../../types';
import { IPortModeInformationRequestMessageFactory } from '../../features';

@injectable()
export class PortModeInformationRequestOutboundMessageFactory implements IPortModeInformationRequestMessageFactory {
  public createPortModeInformationRequest(
    portId: number,
    mode: number,
    modeInformationType: PortModeInformationType
  ): RawMessage<MessageType.portModeInformationRequest> {
    return {
      header: {
        messageType: MessageType.portModeInformationRequest,
      },
      payload: Uint8Array.from([portId, mode, modeInformationType]),
    };
  }
}
