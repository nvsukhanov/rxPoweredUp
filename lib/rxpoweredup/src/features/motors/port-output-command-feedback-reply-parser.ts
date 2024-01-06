import { InjectionToken } from 'tsyringe';

import { MessageType } from '../../constants';
import { IReplyParser } from '../../hub';

export const PORT_OUTPUT_COMMAND_FEEDBACK_REPLY_PARSER: InjectionToken<IReplyParser<MessageType.portOutputCommandFeedback>>
    = Symbol('IPortOutputCommandFeedbackReplyParser');
