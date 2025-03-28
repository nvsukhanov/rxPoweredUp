import { IErrorHandler } from './Types';

export class ErrorHandler implements IErrorHandler {
  public handleError(error: Error): void {
    console.error(error);
  }
}
