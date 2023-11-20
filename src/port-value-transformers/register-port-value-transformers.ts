import { container } from 'tsyringe';

import { VoltageValueTransformerFactory } from './voltage-value-transformer-factory';
import { TemperatureValueTransformer } from './temperature-value-transformer';
import { MotorAposValueTransformer } from './motor-apos-value-transformer';
import { MotorPosValueTransformer } from './motor-pos-value-transformer';
import { TiltValueTransformer } from './tilt-value-transformer';
import { ColorValueTransformer } from './color-value-transformer';

export function registerPortValueTransformers(): void {
    container.registerSingleton(MotorAposValueTransformer);
    container.registerSingleton(MotorPosValueTransformer);
    container.registerSingleton(VoltageValueTransformerFactory);
    container.registerSingleton(TiltValueTransformer);
    container.registerSingleton(TemperatureValueTransformer);
    container.registerSingleton(ColorValueTransformer);
}
