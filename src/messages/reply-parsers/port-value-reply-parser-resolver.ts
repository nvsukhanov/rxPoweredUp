import { PortValueAbsolutePositionReplyParser } from './port-value/port-value-absolute-position-reply-parser';
import { MessageType, PortModeName } from '../../constants';
import { IReplyParser } from '../i-reply-parser';
import { PortValueSpeedReplyParser } from './port-value/port-value-speed-reply-parser';
import { injectable } from 'tsyringe';

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
