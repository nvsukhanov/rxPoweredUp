import { InjectionToken } from 'tsyringe';

import { IReplyParser } from '../i-reply-parser';
import { MessageType } from '../../constants';

export const ATTACHED_IO_REPLIES_PARSER: InjectionToken<IReplyParser<MessageType.attachedIO>> = Symbol('ATTACHED_IO_REPLIES_PARSER');
