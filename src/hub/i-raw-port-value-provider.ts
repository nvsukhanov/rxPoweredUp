import { Observable } from 'rxjs';

import { IPortValueTransformer } from './i-port-value-transformer';

export interface IRawPortValueProvider {
    /**
     * Reads raw port value for a given port and mode id.
     * Stream completes when the response is received from the hub.
     *
     * @param portId - The port id to read the value for.
     * @param modeId - The mode id to read the value for.
     * @param transformer - Optional transformer to convert the raw value into a value that can be used by the application (or read by humans).
     */
    getRawPortValue<TTransformer extends IPortValueTransformer<unknown> | void = void>(
        portId: number,
        modeId: number,
        transformer?: TTransformer
    ): TTransformer extends IPortValueTransformer<infer R> ? Observable<R> : Observable<number[]>;

    /**
     * Provides port value updates for a given port and mode id.
     *
     * @param portId - The port id to read the value for.
     * @param modeId - The mode id to read the value for.
     * @param deltaThreshold If the difference between the current value and the previous value is less than this threshold, the value will not be emitted.
     * @param transformer - Optional transformer to convert the raw value into a value that can be used by the application (or read by humans).
     */
    rawPortValueChanges<TTransformer extends IPortValueTransformer<unknown> | void = void>(
        portId: number,
        modeId: number,
        deltaThreshold: number,
        transformer?: TTransformer
    ): TTransformer extends IPortValueTransformer<infer R> ? Observable<R> : Observable<number[]>;
}
