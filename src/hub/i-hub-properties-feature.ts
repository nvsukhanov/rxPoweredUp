import { Observable } from 'rxjs';

export interface IHubPropertiesFeature {
    // Emits the battery level of the hub on subscription and whenever it changes.
    readonly batteryLevel: Observable<number>;
    // Emits the RSSI level of the hub on subscription and whenever it changes.
    readonly rssiLevel: Observable<number>;
    // Emits the button state of the hub on subscription and whenever it changes.
    readonly buttonState: Observable<boolean>;

    // Reads the advertising name of the hub.
    // The advertising name is a user-friendly name that is used to identify the hub.
    requestAdvertisingName(): Observable<string>;

    // Reads the battery level of the hub.
    requestBatteryLevel(): Observable<number>;

    // Reads the RSSI (Received Signal Strength Indicator) level of the hub.
    requestRSSILevel(): Observable<number>;

    // Reads the button state of the hub (true - pressed, false - released).
    requestButtonState(): Observable<boolean>;

    // Reads the primary MAC address of the hub.
    // Can be used as a unique identifier for the hub.
    requestPrimaryMacAddress(): Observable<string>;

    // Sets the advertising name of the hub.
    // The advertising name is a user-friendly name that is used to identify the hub.
    // The name must be between 1 and 14 characters long.
    // The name must only contain alphanumeric characters and spaces.
    setHubAdvertisingName(
        advertisingName: string
    ): Observable<void>;
}
