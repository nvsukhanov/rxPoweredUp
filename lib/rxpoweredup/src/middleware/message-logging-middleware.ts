import { IMessageMiddleware } from '../hub';
import { MessageType } from '../constants';
import { ILogger, RawMessage } from '../types';
import { formatMessageForDump } from '../helpers';

export class MessageLoggingMiddleware implements IMessageMiddleware {
    private readonly logMessageTypesSet: ReadonlySet<MessageType>;

    constructor(
        private readonly logger: ILogger,
        private readonly logMessageTypes: MessageType[] | 'all'
    ) {
        this.logMessageTypesSet = new Set(logMessageTypes === 'all' ? [] : logMessageTypes);
    }

    public handle<T extends RawMessage<MessageType>>(
        originalMessage: T
    ): T {
        if (this.logMessageTypes === 'all' || this.logMessageTypesSet.has(originalMessage.header.messageType)) {
            const formattedMessage = formatMessageForDump(originalMessage);
            this.logger.debug(formattedMessage);
        }
        return originalMessage;
    }
}
