import { Observable } from 'rxjs';

export interface IRawPortValueProvider {
    /**
     * Reads raw port value for a given port and mode id.
     * Stream completes when the response is received from the hub.
     *
     * @param portId
     * @param modeId
     */
    getRawPortValue(
        portId: number,
        modeId: number
    ): Observable<number[]>;

    /**
     * Provides port value updates for a given port and mode id.
     *
     * @param portId
     * @param modeId
     * @param deltaThreshold If the difference between the current value and the previous value is less than this threshold, the value will not be emitted.
     */
    rawPortValueChanges(
        portId: number,
        modeId: number,
        deltaThreshold?: number
    ): Observable<number[]>;
}
