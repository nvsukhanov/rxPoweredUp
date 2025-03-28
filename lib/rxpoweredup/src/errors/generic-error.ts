import { GenericErrorCode, MessageType } from '../constants';

export class GenericError extends Error {
  constructor(public readonly code: GenericErrorCode, public readonly commandType: MessageType) {
    super(`Generic error ${GenericErrorCode[code]} for command ${MessageType[commandType]}`);
  }
}
