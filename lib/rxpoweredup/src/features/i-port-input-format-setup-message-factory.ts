import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../types';
import { MessageType } from '../constants';

export interface IPortInputFormatSetupMessageFactory {
  createMessage(
    portId: number,
    mode: number,
    notificationsEnabled: true,
    deltaThreshold?: number
  ): RawMessage<MessageType.portInputFormatSetupSingle>;

  createMessage(
    portId: number,
    mode: number,
    notificationsEnabled: false
  ): RawMessage<MessageType.portInputFormatSetupSingle>;
}

export const PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY: InjectionToken<IPortInputFormatSetupMessageFactory> = Symbol(
  'PORT_INPUT_FORMAT_SETUP_SINGLE_MESSAGE_FACTORY'
);
