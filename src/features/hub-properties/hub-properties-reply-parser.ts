import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../i-reply-parser';
import { MessageType } from '../../constants';

export const HUB_PROPERTIES_REPLIES_PARSER: InjectionToken<IReplyParser<MessageType.properties>> = Symbol('HUB_PROPERTIES_REPLIES_PARSER');
