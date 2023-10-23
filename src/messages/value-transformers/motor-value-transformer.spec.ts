import { MotorValueTransformer } from './motor-value-transformer';

describe('RawPortValueParser', () => {
    let subject: MotorValueTransformer;

    beforeEach(() => {
        subject = new MotorValueTransformer();
    });

    describe('getAbsolutePosition', () => {
        it('should return the absolute position', () => {
            expect(subject.fromRawToAbsolutePosition([ 0x00, 0x00 ])).toBe(0);
            expect(subject.fromRawToAbsolutePosition([ 0xF1, 0xFF ])).toBe(-15);
            expect(subject.fromRawToAbsolutePosition([ 0x22, 0x00 ])).toBe(34);
        });
    });

    describe('getPosition', () => {
        it('should return the position', () => {
            expect(subject.fromRawToPosition([ 0x00, 0x00, 0x00, 0x00 ])).toBe(0);
            expect(subject.fromRawToPosition([ 0xB9, 0xFE, 0xFF, 0xFF ])).toBe(-327);
            expect(subject.fromRawToPosition([ 0x22, 0x00, 0x00, 0x00 ])).toBe(34);
        });
    });
});
