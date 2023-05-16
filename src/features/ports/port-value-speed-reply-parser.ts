import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../i-reply-parser';
import { MessageType } from '../../constants';

export const PORT_VALUE_SPEED_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.portValueSingle>> = Symbol('PORT_VALUE_SPEED_REPLY_PARSER');
