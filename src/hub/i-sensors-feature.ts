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
     * @param portId The port to read from.
     * @param modeId The mode to read from.
     * @param hubType The type of hub to read from. Different hubs has different math for calculating voltage. Defaults to HubType.Unknown.
     */
    getVoltage(
        portId: number,
        modeId: number,
        hubType?: HubType
    ): Observable<number>;

    /**
     * Emits when the voltage changes.
     * @param portId
     * @param modeId
     * @param threshold - The minimum change in voltage to trigger an event.
     * @param hubType The type of hub to read from. Different hubs has different math for calculating voltage. Defaults to HubType.Unknown.
     */
    voltageChanges(
        portId: number,
        modeId: number,
        threshold: number,
        hubType?: HubType,
    ): Observable<number>;

    /**
     * Read tilt data from a tilt sensor.
     * Offset resets when the sensor (or hub) is restarted.
     * @param portId - The port to read from.
     * @param modeId - The mode to use when reading.
     */
    getTilt(
        portId: number,
        modeId: number
    ): Observable<TiltData>;

    /**
     * Emits when the tilt of a tilt sensor changes.
     * @param portId
     * @param modeId
     * @param threshold - The minimum change in any axis tilt in degrees to trigger an event.
     */
    tiltChanges(
        portId: number,
        modeId: number,
        threshold: number
    ): Observable<TiltData>;

    /**
     * Read temperature from a sensor port in degrees Celsius.
     * @param portId
     * @param modeId
     */
    getTemperature(
        portId: number,
        modeId: number
    ): Observable<number>;

    /**
     * Emits when the temperature changes. The temperature is in degrees Celsius.
     * @param portId
     * @param modeId
     * @param threshold
     */
    temperatureChanges(
        portId: number,
        modeId: number,
        threshold: number
    ): Observable<number>;
}
