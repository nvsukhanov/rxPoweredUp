export function numberToHex(
    value: number
): string {
    return value.toString(16).padStart(2, '0').toLocaleUpperCase();
}
