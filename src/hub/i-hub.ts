import { Observable } from 'rxjs';

import { IHubPropertiesFeature, IIoFeature, IMotorFeature } from '../features';

export interface IHub {
    readonly ports: IIoFeature;
    readonly motor: IMotorFeature;
    readonly properties: IHubPropertiesFeature;
    readonly beforeDisconnect$: Observable<void>;
    readonly disconnected$: Observable<void>;

    connect(): Promise<void>

    disconnect(): Promise<void>
}
