import { InjectionToken } from 'tsyringe';

export interface ILegoHubConfig {
    readonly maxGattConnectRetries: number;
    readonly minimumAllowedIOPollInterval: number;
    readonly outboundMessageReplyTimeout: number;
    readonly outboundMessageRetriesCount: number;
}

export const DEFAULT_CONFIG: ILegoHubConfig = {
    maxGattConnectRetries: 5,
    minimumAllowedIOPollInterval: 100,
    outboundMessageReplyTimeout: 300,
    outboundMessageRetriesCount: 5,
};

export const LEGO_HUB_CONFIG: InjectionToken<ILegoHubConfig> = Symbol('LEGO_HUB_CONFIG');
