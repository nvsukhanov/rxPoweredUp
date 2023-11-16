import { MotorAposValueTransformer } from './motor-apos-value-transformer';

describe('MotorAposValueTransformer', () => {
    let subject: MotorAposValueTransformer;

    beforeEach(() => {
        subject = new MotorAposValueTransformer();
    });

    describe('fromRawValue', () => {
        it('should return the absolute position', () => {
            expect(subject.fromRawValue([ 0x00, 0x00 ])).toBe(0);
            expect(subject.fromRawValue([ 0xF1, 0xFF ])).toBe(-15);
            expect(subject.fromRawValue([ 0x22, 0x00 ])).toBe(34);
        });
    });

    describe('toValueThreshold', () => {
        it('should return the threshold', () => {
            expect(subject.toValueThreshold(0)).toBe(0);
            expect(subject.toValueThreshold(-327)).toBe(-327);
            expect(subject.toValueThreshold(34)).toBe(34);
        });
    });
});
