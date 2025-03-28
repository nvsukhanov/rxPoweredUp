import { Observable } from 'rxjs';

import { HubType } from '../constants';
import type { VersionInformation } from '../types';

export interface IHubPropertiesFeature {
  /**
   * Emits the battery level of the hub on subscription and whenever it changes.
   * Stream completes when the hub is disconnected.
   */
  readonly batteryLevel: Observable<number>;

  /**
   * Emits the RSSI level of the hub on subscription and whenever it changes.
   * Stream completes when the hub is disconnected.
   */
  readonly rssiLevel: Observable<number>;

  /**
   * Emits the button state of the hub on subscription and whenever it changes.
   * Stream completes when the hub is disconnected.
   */
  readonly buttonState: Observable<boolean>;

  /**
   * Reads the advertising name of the hub.
   * The advertising name is a user-friendly name that is used to identify the hub.
   *
   * Stream completes when the response is received from the hub.
   */
  getAdvertisingName(): Observable<string>;

  /**
   * Reads the battery level of the hub.
   * Stream completes when the response is received from the hub.
   */
  getBatteryLevel(): Observable<number>;

  /**
   * Reads the RSSI (Received Signal Strength Indicator) level of the hub.
   * It's not a dBm value, but still useful for comparing signal strength between hubs.
   * The more negative the value, the stronger the signal.
   * Stream completes when the response is received from the hub.
   */
  getRSSILevel(): Observable<number>;

  /**
   * Reads the button state of the hub (true - pressed, false - released).
   * Stream completes when the response is received from the hub.
   */
  getButtonState(): Observable<boolean>;

  /**
   * Reads the system type ID of the hub, which maps to a specific hub type.
   * Stream completes when the response is received from the hub.
   */
  getSystemTypeId(): Observable<HubType>;

  /**
   * Reads the manufacturer name of the hub.
   */
  getManufacturerName(): Observable<string>;

  /**
   * Reads the primary MAC address of the hub (can be used as a unique identifier for the hub)
   * Stream completes when the response is received from the hub.
   */
  getPrimaryMacAddress(): Observable<string>;

  /**
   * Sets the advertising name of the hub.
   * The advertising name is a user-friendly name that is used to identify the hub.
   * Stream completes when the command is executed by the hub.
   *
   * @param advertisingName - alphanumeric name (1-14 characters long) with spaces.
   */
  setHubAdvertisingName(advertisingName: string): Observable<void>;

  /**
   * Reads the firmware version of the hub.
   * Stream completes when the response is received from the hub.
   */
  getFirmwareVersion(): Observable<VersionInformation>;

  /**
   * Reads the hardware version of the hub.
   * Stream completes when the response is received from the hub.
   */
  getHardwareVersion(): Observable<VersionInformation>;
}
