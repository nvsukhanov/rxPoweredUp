import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';

export const HUB_ACTIONS_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.action>> =
  Symbol('HUB_ACTIONS_REPLY_PARSER');
