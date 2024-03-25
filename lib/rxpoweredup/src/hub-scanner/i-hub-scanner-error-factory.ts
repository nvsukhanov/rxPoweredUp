import { InjectionToken } from 'tsyringe';

export interface IHubScannerErrorFactory {
    createConnectionCancelledByUserError(): Error;

    createGattUnavailableError(): Error;
}

export const HUB_SCANNER_ERROR_FACTORY: InjectionToken<IHubScannerErrorFactory> = Symbol('IHubScannerErrorFactory');
