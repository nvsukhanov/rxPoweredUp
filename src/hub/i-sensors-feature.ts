import { Observable } from 'rxjs';

import { HubType } from '../constants';

/**
 * Data from a tilt sensor. The values are in degrees (-180 to 180).
 */
export type TiltData = {
    roll: number;
    pitch: number;
    yaw: number;
}

export interface ISensorsFeature {
    /**
     * Read voltage from a sensor port.
     * @param portId - The port to read from.
     * @param modeId - The mode to read from. Defaults to the well-known tilt mode id (unreliable, may not work with some voltage sensors).
     * @param hubType  - The type of hub to read from. Different hubs has different math for calculating voltage. Defaults to HubType.Unknown.
     */
    getVoltage(
        portId: number,
        modeId?: number,
        hubType?: HubType
    ): Observable<number>;

    /**
     * Emits when the voltage changes.
     * @param portId - The port to read from.
     * @param modeId - The mode to read from. Optional, defaults to the well-known tilt mode id (unreliable, may not work with some voltage sensors).
     * @param threshold - The minimum change in voltage to trigger an event. Optional, defaults to 0.01.
     * @param hubType - The type of hub to read from. Different hubs has different math for calculating voltage. Optional, defaults to HubType.Unknown.
     */
    voltageChanges(
        portId: number,
        modeId?: number,
        threshold?: number,
        hubType?: HubType,
    ): Observable<number>;

    /**
     * Read tilt data from a tilt sensor.
     * Offset resets when the sensor (or hub) is restarted.
     * @param portId - The port to read from.
     * @param modeId - The mode to use when reading. Optional, defaults to the well-known tilt mode id (unreliable, may not work with some tilt sensors).
     */
    getTilt(
        portId: number,
        modeId?: number
    ): Observable<TiltData>;

    /**
     * Emits when the tilt of a tilt sensor changes.
     * @param portId - The port to read from.
     * @param modeId - The mode to use when reading. Optional, defaults to the well-known tilt mode id (unreliable, may not work with some tilt sensors).
     * @param threshold - The minimum change in any axis tilt in degrees to trigger an event. Optional, defaults to 1.
     */
    tiltChanges(
        portId: number,
        modeId?: number,
        threshold?: number
    ): Observable<TiltData>;

    /**
     * Read temperature from a sensor port in degrees Celsius.
     * @param portId - The port to read from.
     * @param modeId - The mode to use when reading. Optional, defaults to the well-known tilt mode id (unreliable, may not work with some temperature sensors).
     */
    getTemperature(
        portId: number,
        modeId?: number
    ): Observable<number>;

    /**
     * Emits when the temperature changes. The temperature is in degrees Celsius.
     * @param portId - The port to read from.
     * @param modeId - The mode to use when reading. Optional, defaults to the well-known tilt mode id (unreliable, may not work with some tilt sensors).
     * @param threshold - The minimum change in temperature to trigger an event. Optional, defaults to 1.
     */
    temperatureChanges(
        portId: number,
        modeId?: number,
        threshold?: number
    ): Observable<number>;
}
