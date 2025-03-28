import { IReplyParser } from '../../hub';
import { MessageType } from '../../constants';
import { HubActionInboundMessage, RawMessage } from '../../types';

export class HubActionsReplyParser implements IReplyParser<MessageType.action> {
  public readonly messageType = MessageType.action;

  public parseMessage(message: RawMessage<MessageType.action>): HubActionInboundMessage {
    return {
      messageType: MessageType.action,
      actionType: message.payload[0],
    };
  }
}
