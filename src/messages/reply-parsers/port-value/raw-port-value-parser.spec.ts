import 'reflect-metadata';
import { RawPortValueParser } from './raw-port-value-parser';

describe('RawPortValueParser', () => {
    let subject: RawPortValueParser;

    beforeEach(() => {
        subject = new RawPortValueParser();
    });

    describe('getAbsolutePosition', () => {
        it('should return the absolute position', () => {
            expect(subject.getAbsolutePosition([ 0x00, 0x00 ])).toBe(0);
            expect(subject.getAbsolutePosition([ 0xF1, 0xFF ])).toBe(-15);
            expect(subject.getAbsolutePosition([ 0x22, 0x00 ])).toBe(34);
        });
    });

    describe('getPosition', () => {
        it('should return the position', () => {
            expect(subject.getPosition([ 0x00, 0x00, 0x00, 0x00 ])).toBe(0);
            expect(subject.getPosition([ 0xB9, 0xFE, 0xFF, 0xFF ])).toBe(-327);
            expect(subject.getPosition([ 0x22, 0x00, 0x00, 0x00 ])).toBe(34);
        });
    });
});
