import { InjectionToken } from 'tsyringe';

export interface ILegoHubConfig {
    readonly maxGattConnectRetries: number;
    readonly minimumAllowedIOPollInterval: number;
    readonly maxMessageSendRetries: number;
    readonly messageSendTimeout: number;
}

export const DEFAULT_CONFIG: ILegoHubConfig = {
    maxGattConnectRetries: 5,
    minimumAllowedIOPollInterval: 100,
    maxMessageSendRetries: 4,
    messageSendTimeout: 300
};

export const LEGO_HUB_CONFIG: InjectionToken<ILegoHubConfig> = Symbol('LEGO_HUB_CONFIG');
