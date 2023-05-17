import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';

export const PORT_MODE_INFORMATION_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.portModeInformation>> = Symbol('PORT_MODE_INFORMATION_REPLY_PARSER');
