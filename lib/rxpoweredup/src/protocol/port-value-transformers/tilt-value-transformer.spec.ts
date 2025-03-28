import { TiltValueTransformer } from './tilt-value-transformer';

describe('TiltValueTransformer', () => {
  let subject: TiltValueTransformer;

  beforeEach(() => {
    subject = new TiltValueTransformer();
  });

  describe('fromRawValue', () => {
    it('should return the tilt', () => {
      expect(subject.fromRawValue([0x00, 0x00, 0x00, 0x00, 0x00, 0x00])).toEqual({ pitch: 0, yaw: 0, roll: 0 });
      expect(subject.fromRawValue([0xaa, 0x00, 0x00, 0x00, 0x00, 0x00])).toEqual({ pitch: 0, yaw: -170, roll: 0 });
      expect(subject.fromRawValue([0xaa, 0xaa, 0x00, 0x00, 0x00, 0x00])).toEqual({ pitch: 0, yaw: 66, roll: 0 });
      expect(subject.fromRawValue([0xaa, 0xaa, 0xaa, 0x00, 0x00, 0x00])).toEqual({ pitch: 170, yaw: 66, roll: 0 });
      expect(subject.fromRawValue([0xaa, 0xaa, 0xaa, 0xaa, 0x00, 0x00])).toEqual({ pitch: -66, yaw: 66, roll: 0 });
      expect(subject.fromRawValue([0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0x00])).toEqual({ pitch: -66, yaw: 66, roll: -170 });
      expect(subject.fromRawValue([0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa])).toEqual({ pitch: -66, yaw: 66, roll: 66 });
      expect(subject.fromRawValue([0xff, 0xff, 0xff, 0xff, 0xff, 0xff])).toEqual({ pitch: -1, yaw: 1, roll: 1 });
    });
  });

  describe('toValueThreshold', () => {
    it('should return the minimum value', () => {
      expect(subject.toValueThreshold({ yaw: 100, pitch: 99, roll: 100 })).toEqual(99);
      expect(subject.toValueThreshold({ yaw: 100, pitch: 100, roll: 99 })).toEqual(99);
      expect(subject.toValueThreshold({ yaw: 99, pitch: 100, roll: 100 })).toEqual(99);
    });
  });
});
