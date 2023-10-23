import { InjectionToken } from 'tsyringe';

export interface IMotorValueTransformer {
    fromRawToAbsolutePosition(rawPortValue: number[]): number;

    fromRawToPosition(rawPortValue: number[]): number;

    fromRawToSpeed(rawPortValue: number[]): number;
}

export const MOTOR_VALUE_TRANSFORMER: InjectionToken<IMotorValueTransformer> = Symbol('MOTOR_VALUE_TRANSFORMER');
