import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';

export const PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.portValueSingle>>
    = Symbol('PORT_VALUE_ABSOLUTE_POSITION_REPLY_PARSER');
