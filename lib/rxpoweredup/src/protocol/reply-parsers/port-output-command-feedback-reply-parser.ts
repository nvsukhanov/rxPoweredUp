import { injectable } from 'tsyringe';

import { IReplyParser } from '../../hub';
import { MessageType, PortCommandFeedbackMask } from '../../constants';
import { PortOutputCommandFeedbackInboundMessage, RawMessage } from '../../types';

@injectable()
export class PortOutputCommandFeedbackReplyParser implements IReplyParser<MessageType.portOutputCommandFeedback> {
  public readonly messageType = MessageType.portOutputCommandFeedback;

  public parseMessage(message: RawMessage<MessageType.portOutputCommandFeedback>): PortOutputCommandFeedbackInboundMessage {
    return {
      messageType: MessageType.portOutputCommandFeedback,
      portId: message.payload[0],
      feedback: {
        bufferEmptyCommandInProgress: !!(message.payload[1] & PortCommandFeedbackMask.bufferEmptyCommandInProgress),
        bufferEmptyCommandCompleted: !!(message.payload[1] & PortCommandFeedbackMask.bufferEmptyCommandCompleted),
        currentCommandDiscarded: !!(message.payload[1] & PortCommandFeedbackMask.currentCommandDiscarded),
        idle: !!(message.payload[1] & PortCommandFeedbackMask.idle),
        busyOrFull: !!(message.payload[1] & PortCommandFeedbackMask.busyOrFull),
        executionError: !!(message.payload[1] & PortCommandFeedbackMask.executionError),
      },
    };
  }
}
