import { Observable } from 'rxjs';

export interface IHubPropertiesFeature {
    /**
     * Emits the battery level of the hub on subscription and whenever it changes.
     */
    readonly batteryLevel: Observable<number>;

    /**
     * Emits the RSSI level of the hub on subscription and whenever it changes.
     */
    readonly rssiLevel: Observable<number>;

    /**
     * Emits the button state of the hub on subscription and whenever it changes.
     */
    readonly buttonState: Observable<boolean>;

    /**
     * Reads the advertising name of the hub.
     * The advertising name is a user-friendly name that is used to identify the hub.
     */
    requestAdvertisingName(): Observable<string>;

    /**
     * Reads the battery level of the hub.
     */
    requestBatteryLevel(): Observable<number>;

    /**
     * Reads the RSSI (Received Signal Strength Indicator) level of the hub.
     * It's not a dBm value, but still useful for comparing signal strength between hubs.
     * The more negative the value, the stronger the signal.
     */
    requestRSSILevel(): Observable<number>;

    /**
     * Reads the button state of the hub (true - pressed, false - released).
     */
    requestButtonState(): Observable<boolean>;

    /**
     * Reads the primary MAC address of the hub.
     * Can be used as a unique identifier for the hub.
     */
    requestPrimaryMacAddress(): Observable<string>;

    /**
     * Sets the advertising name of the hub.
     * The advertising name is a user-friendly name that is used to identify the hub.
     * @param advertisingName - alphanumeric name (1-14 characters long) with spaces.
     */
    setHubAdvertisingName(
        advertisingName: string
    ): Observable<void>;
}
