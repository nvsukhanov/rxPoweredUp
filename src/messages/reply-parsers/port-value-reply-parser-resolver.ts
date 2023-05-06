import { injectable } from 'tsyringe';

import { PortValueAbsolutePositionReplyParser, PortValueSpeedReplyParser } from './port-value';
import { MessageType, PortModeName } from '../../constants';
import { IReplyParser } from '../i-reply-parser';

@injectable()
export class PortValueReplyParserResolver { // TODO: refactor to chain of responsibility
    private readonly portValueParsers: { [m in PortModeName]?: IReplyParser<MessageType.portValueSingle> } = {
        [PortModeName.absolutePosition]: this.portValueAbsolutePositionReplyParserService,
        [PortModeName.speed]: this.portValueSpeedReplyParserService
    };

    constructor(
        private readonly portValueAbsolutePositionReplyParserService: PortValueAbsolutePositionReplyParser,
        private readonly portValueSpeedReplyParserService: PortValueSpeedReplyParser,
    ) {
    }

    public resolve(
        modeName: PortModeName
    ): IReplyParser<MessageType.portValueSingle> | undefined {
        return this.portValueParsers[modeName];
    }
}
