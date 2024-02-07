import { Observable } from 'rxjs';

import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IMotorsFeature } from './i-motors-feature';
import { IPortsFeature } from './i-ports-feature';
import { IRgbLightFeature } from './i-rgb-light-feature';

export interface IHub {
    /**
     * Emits whe the hub has received a power off command or when the hub is going to be switched off by the power button.
     * Will replay the switch-off notification to new subscribers (if the hub is already in the process of switching off).
     */
    readonly willSwitchOff: Observable<void>;

    /**
     * Emits when the hub is going to be disconnected (after the hub has received a disconnect
     * command or when the hub is going to be switched off by the power button).
     */
    readonly willDisconnect: Observable<void>;

    /**
     * Provides a way to access the ports information of the hub.
     * e.g. listen to port attach/detach events, request port value, etc.
     * Hub identifies ports by their numerical index (not by their literal name engraved on the hub).
     * e.g. port A is index 0, port B is index 1, etc.
     * Also note that hubs usually have internal ports that can be accessed by their index as well (e.g. 50).
     * On hub connection, the hub will emit a port attach event for each port that has a device attached to it, including internal ports.
     */
    readonly ports: IPortsFeature;

    /**
     * Provides a way to send commands to motors attached to ports.
     * e.g. start motor, etc
     */
    readonly motors: IMotorsFeature;

    /**
     * Provides a way to access the properties of the hub.
     * e.g. listen to battery level changes, set hub advertising name, etc.
     */
    readonly properties: IHubPropertiesFeature;

    /**
     * Provides a way to set color for the RGB light.
     */
    readonly rgbLight: IRgbLightFeature;

    /**
     * Emits when the hub is disconnected.
     * Can be used to perform actions after the hub is disconnected.
     * Will replay the disconnect notification to new subscribers (if the hub is already disconnected).
     */
    readonly disconnected: Observable<void>;

    /**
     * Gracefully disconnects from the hub.
     */
    disconnect(): Observable<void>

    /**
     * Gracefully powers off the hub.
     */
    switchOff(): Observable<void>;
}
