import { GenericErrorCode, MessageType } from '../constants';

export type GenericError = {
    commandType: MessageType;
    code: GenericErrorCode;
}
