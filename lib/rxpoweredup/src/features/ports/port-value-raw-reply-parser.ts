import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';

export const PORT_RAW_VALUE_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.portValueSingle>> =
  Symbol('PORT_RAW_VALUE_REPLY_PARSER');
