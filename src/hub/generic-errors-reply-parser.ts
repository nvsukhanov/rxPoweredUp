import { InjectionToken } from 'tsyringe';

import { MessageType } from '../constants';
import { IReplyParser } from './i-reply-parser';

export const GENERIC_ERRORS_REPLIES_PARSER: InjectionToken<IReplyParser<MessageType.genericError>> = Symbol('GENERIC_ERRORS_REPLIES_PARSER');
