// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type LastOfTuple<T extends unknown[]> = T extends readonly [...infer _, infer K] ? K : never;
