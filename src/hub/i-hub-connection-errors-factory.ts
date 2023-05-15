import { InjectionToken } from 'tsyringe';

export interface IHubConnectionErrorsFactory {
    createGattConnectionError(): Error;
}

export const HUB_CONNECTION_ERRORS_FACTORY: InjectionToken<IHubConnectionErrorsFactory> = Symbol('IHubConnectionErrorsFactory');
