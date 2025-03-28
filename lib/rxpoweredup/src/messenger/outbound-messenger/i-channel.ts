import { RawMessage } from '../../types';
import { MessageType } from '../../constants';

export interface IChannel {
  sendMessage(message: RawMessage<MessageType>, beforeSend?: () => void): Promise<void>;
}
