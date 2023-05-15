import { Observable } from 'rxjs';

import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { ICommandsFeature } from './i-commands-feature';
import { IIoFeature } from './i-io-feature';

export interface IHub {
    readonly ports: IIoFeature;
    readonly commands: ICommandsFeature;
    readonly properties: IHubPropertiesFeature;
    readonly beforeDisconnect$: Observable<void>;
    readonly disconnected$: Observable<void>;

    connect(): Promise<void>

    disconnect(): Promise<void>
}
