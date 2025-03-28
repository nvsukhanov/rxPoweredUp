import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../../types';
import { MessageType } from '../../constants';

export interface IPortInformationRequestMessageFactory {
  createPortValueRequest(portId: number): RawMessage<MessageType.portInformationRequest>;

  createPortModeRequest(portId: number): RawMessage<MessageType.portInformationRequest>;
}

export const PORT_INFORMATION_REQUEST_MESSAGE_FACTORY: InjectionToken<IPortInformationRequestMessageFactory> = Symbol(
  'PORT_INFORMATION_REQUEST_MESSAGE_FACTORY'
);
