import { InjectionToken } from 'tsyringe';

export interface IHubScannerErrorFactory {
    createGattUnavailableError(): Error;
}

export const HUB_SCANNER_ERROR_FACTORY: InjectionToken<IHubScannerErrorFactory> = Symbol('IHubScannerErrorFactory');
