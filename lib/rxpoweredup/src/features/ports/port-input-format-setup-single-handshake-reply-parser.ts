import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';

export const PORT_INPUT_FORMAT_SETUP_SINGLE_HANDSHAKE_REPLY_PARSER: InjectionToken<
  IReplyParser<MessageType.portInputFormatSetupSingleHandshake>
> = Symbol('IPortInputFormatSetupSingleHandshakeReplyParser');
