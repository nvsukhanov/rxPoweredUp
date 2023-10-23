import { Observable } from 'rxjs';

import { HubType } from '../constants';

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
}
