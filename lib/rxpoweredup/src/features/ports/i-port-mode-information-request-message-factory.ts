import { InjectionToken } from 'tsyringe';

import { MessageType, PortModeInformationType } from '../../constants';
import { RawMessage } from '../../types';

export interface IPortModeInformationRequestMessageFactory {
  createPortModeInformationRequest(
    portId: number,
    mode: number,
    modeInformationType: PortModeInformationType
  ): RawMessage<MessageType.portModeInformationRequest>;
}

export const PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY: InjectionToken<IPortModeInformationRequestMessageFactory> =
  Symbol('PORT_MODE_INFORMATION_REQUEST_MESSAGE_FACTORY');
