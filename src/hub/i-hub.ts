import { Observable } from 'rxjs';

import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IPortOutputCommandsFeature } from './i-port-output-commands-feature';
import { IIoFeature } from './i-io-feature';

export interface IHub {
    readonly ports: IIoFeature;
    readonly commands: IPortOutputCommandsFeature;
    readonly properties: IHubPropertiesFeature;
    readonly beforeDisconnect: Observable<void>;
    readonly disconnected: Observable<void>;

    connect(): Observable<void>

    disconnect(): Observable<void>
}
