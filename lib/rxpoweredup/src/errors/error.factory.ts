import { injectable } from 'tsyringe';

import { ConnectionError } from './connection-error';
import { HubProperty } from '../constants';
import { IHubPropertiesFeatureErrorsFactory } from '../features';
import { IHubConnectionErrorsFactory } from '../hub';
import { IHubScannerErrorFactory } from '../hub-scanner';

@injectable()
export class ErrorFactory implements IHubPropertiesFeatureErrorsFactory, IHubConnectionErrorsFactory, IHubScannerErrorFactory {
    public createInvalidPropertyValueError(property: HubProperty, value: number[] | number | string | string[]): ConnectionError {
        return new ConnectionError(`Invalid property value ${value} for property ${HubProperty[property]}`);
    }

    public createGattUnavailableError(): ConnectionError {
        return new ConnectionError('Hub GATT is unavailable');
    }

    public createGattConnectionError(): ConnectionError {
        return new ConnectionError('Hub GATT connection error');
    }
}
