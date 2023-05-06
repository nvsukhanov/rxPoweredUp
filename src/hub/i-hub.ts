import { Observable } from 'rxjs';

import { ICommandsFeature, IHubPropertiesFeature, IIoFeature } from '../features';

export interface IHub {
    readonly ports: IIoFeature;
    readonly commands: ICommandsFeature;
    readonly properties: IHubPropertiesFeature;
    readonly beforeDisconnect$: Observable<void>;
    readonly disconnected$: Observable<void>;

    connect(): Promise<void>

    disconnect(): Promise<void>
}
