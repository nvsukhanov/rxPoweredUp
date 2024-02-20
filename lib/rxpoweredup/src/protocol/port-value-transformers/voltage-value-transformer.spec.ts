import { VoltageValueTransformer } from './voltage-value-transformer';

describe('VoltageValueTransformer', () => {
    let subject: VoltageValueTransformer;
    let divisor: number;

    beforeEach(() => {
        divisor = 100;
        subject = new VoltageValueTransformer(divisor);
    });

    describe('fromRawValue', () => {
        it('should return the voltage', () => {
            expect(subject.fromRawValue([ 0x00, 0x00 ])).toBe(0);
            expect(subject.fromRawValue([ 0x01, 0x00 ])).toBe(0.01);
            expect(subject.fromRawValue([ 0xAA, 0x00 ])).toBe(1.7);
            expect(subject.fromRawValue([ 0xAA, 0xAA ])).toBe(436.9);
            expect(subject.fromRawValue([ 0xFF, 0xFF ])).toBe(655.35);
        });
    });

    describe('toValueThreshold', () => {
        it('should return the minimum value', () => {
            expect(subject.toValueThreshold(0)).toEqual(0);
            expect(subject.toValueThreshold(0.01)).toEqual(1);
            expect(subject.toValueThreshold(1.7)).toEqual(170);
            expect(subject.toValueThreshold(436.9)).toEqual(43690);
            expect(subject.toValueThreshold(655.35)).toEqual(65535);
        });
    });
});
