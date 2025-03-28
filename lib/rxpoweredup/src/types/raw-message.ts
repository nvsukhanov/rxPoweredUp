import { MessageType } from '../constants';

export type CommonMessageHeader<T extends MessageType> = {
  messageType: T;
};

export type RawMessage<T extends MessageType> = {
  header: CommonMessageHeader<T>;
  payload: Uint8Array;
};

export type RawPortOutputCommandMessage = RawMessage<MessageType.portOutputCommand> & {
  portId: number;
  waitForFeedback: boolean;
};
