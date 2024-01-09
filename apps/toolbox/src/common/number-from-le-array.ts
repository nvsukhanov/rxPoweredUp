export function numberFromLeArray(value: number[]): number {
    return [ ...value ].reduce((acc, val, index) => acc + (val << (index * 8)), 0);
}
