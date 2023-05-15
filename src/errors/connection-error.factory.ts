import { injectable } from 'tsyringe';

import { ConnectionError } from './connection-error';
import { HubProperty } from '../constants';
import { IHubPropertiesFeatureErrorsFactory } from '../features';

@injectable()
export class ConnectionErrorFactory implements IHubPropertiesFeatureErrorsFactory {
    public createConnectionError(): ConnectionError {
        return new ConnectionError('Hub connection error', 'hubConnectionError');
    }

    public createUnableToGetPropertyError(property: HubProperty): ConnectionError {
        return new ConnectionError('Unable to get primary MAC address', 'hubErrorUnableToGetProperty', { property: HubProperty[property] });
    }

    public createInvalidPropertyValueError(property: HubProperty, value: number[] | number | string | string[]): ConnectionError {
        return new ConnectionError('Invalid property value', 'hubErrorInvalidPropertyValue', { property: HubProperty[property], value: value.toString() });
    }

    public createGattUnavailableError(): ConnectionError {
        return new ConnectionError('Hub GATT is unavailable', 'hubGattUnavailable');
    }

    public createConnectionCancelledByUserError(): ConnectionError {
        return new ConnectionError('Hub connection has been cancelled by user"', 'hubConnectionCancelled');
    }

    public createGattConnectionError(): ConnectionError {
        return new ConnectionError('Hub GATT connection error', 'hubGattConnectionError');
    }
}
