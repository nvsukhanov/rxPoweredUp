export interface IPortValueTransformer<T> {
    /**
     * Converts a raw value received from the hub into a value that can be used by the application (or read by humans).
     * @param value - The raw value received from the hub, usually a low-endian 8-bit integer array.
     */
    fromRawValue(value: number[]): T;

    /**
     * Converts a human-readable threshold value into a threshold value that can be user in port value subscriptions.
     * @param value
     */
    toValueThreshold(value: T): number;
}
