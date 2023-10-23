import { RawPortValueParser } from './raw-port-value-parser';

describe('RawPortValueParser', () => {
    let subject: RawPortValueParser;

    beforeEach(() => {
        subject = new RawPortValueParser();
    });

    describe('getAbsolutePosition', () => {
        it('should return the absolute position', () => {
            expect(subject.parseAbsolutePosition([ 0x00, 0x00 ])).toBe(0);
            expect(subject.parseAbsolutePosition([ 0xF1, 0xFF ])).toBe(-15);
            expect(subject.parseAbsolutePosition([ 0x22, 0x00 ])).toBe(34);
        });
    });

    describe('getPosition', () => {
        it('should return the position', () => {
            expect(subject.parsePosition([ 0x00, 0x00, 0x00, 0x00 ])).toBe(0);
            expect(subject.parsePosition([ 0xB9, 0xFE, 0xFF, 0xFF ])).toBe(-327);
            expect(subject.parsePosition([ 0x22, 0x00, 0x00, 0x00 ])).toBe(34);
        });
    });
});
