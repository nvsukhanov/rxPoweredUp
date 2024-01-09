import { HubType } from 'rxpoweredup';

export const HUB_TYPES_LIST = [
    HubType.FourPortHub,
    HubType.TwoPortHub,
    HubType.BoostHub,
    HubType.TwoPortHandset,
    HubType.WeDoHub,
    HubType.DuploTrain,
    HubType.Unknown
] as const;
