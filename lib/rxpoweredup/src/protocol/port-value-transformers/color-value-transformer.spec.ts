import { ColorValueTransformer } from './color-value-transformer';

describe('ColorValueTransformer', () => {
    let subject: ColorValueTransformer;

    beforeEach(() => {
        subject = new ColorValueTransformer();
    });

    describe('fromRawValue', () => {
        it('should return the correct value', () => {
            const value = subject.fromRawValue([ 1, 42, 3 ]);
            expect(value).toEqual({
                red: 1,
                green: 42,
                blue: 3
            });
        });
    });

    describe('toValueThreshold', () => {
        it('should return the correct value', () => {
            const value = subject.toValueThreshold({
                red: 11,
                green: 22,
                blue: 33
            });
            expect(value).toBe(11);
        });
    });
});
