import { TemperatureValueTransformer } from './temperature-value-transformer';

describe('TemperatureValueTransformer', () => {
  let subject: TemperatureValueTransformer;

  beforeEach(() => {
    subject = new TemperatureValueTransformer();
  });

  describe('fromRawValue', () => {
    it('should return the temperature', () => {
      expect(subject.fromRawValue([0x00, 0x00])).toBe(0);
      expect(subject.fromRawValue([0x01, 0x00])).toBe(0.1);
      expect(subject.fromRawValue([0xaa, 0x00])).toBe(17);
      expect(subject.fromRawValue([0xaa, 0x0a])).toBe(273);
      expect(subject.fromRawValue([0xff, 0xff])).toBe(-0.1);
    });
  });

  describe('toValueThreshold', () => {
    it('should return the raw value', () => {
      expect(subject.toValueThreshold(0)).toBe(0);
      expect(subject.toValueThreshold(0.1)).toBe(1);
      expect(subject.toValueThreshold(1)).toBe(10);
      expect(subject.toValueThreshold(10)).toBe(100);
      expect(subject.toValueThreshold(100)).toBe(1000);
      expect(subject.toValueThreshold(-10)).toBe(-100);
      expect(subject.toValueThreshold(-100)).toBe(-1000);
    });
  });
});
