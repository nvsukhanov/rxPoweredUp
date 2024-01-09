import { InjectionToken } from 'tsyringe';

export interface IErrorHandler {
    handleError(error: Error): void;
}

export const ERROR_HANDLER: InjectionToken<IErrorHandler> = Symbol('ERROR_HANDLER');
