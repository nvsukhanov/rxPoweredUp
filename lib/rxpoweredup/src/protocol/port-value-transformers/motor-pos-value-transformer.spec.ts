import { MotorPosValueTransformer } from './motor-pos-value-transformer';

describe('MotorPosValueTransformer', () => {
    let subject: MotorPosValueTransformer;

    beforeEach(() => {
        subject = new MotorPosValueTransformer();
    });

    describe('fromRawValue', () => {
        it('should return the position', () => {
            expect(subject.fromRawValue([ 0x00, 0x00, 0x00, 0x00 ])).toBe(0);
            expect(subject.fromRawValue([ 0xB9, 0xFE, 0xFF, 0xFF ])).toBe(-327);
            expect(subject.fromRawValue([ 0x22, 0x00, 0x00, 0x00 ])).toBe(34);
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
