import { InjectionToken } from 'tsyringe';

export interface IRawMotorPortValueParser {
    getAbsolutePosition(rawPortValue: number[]): number;

    getPosition(rawPortValue: number[]): number;

    getSpeed(rawPortValue: number[]): number;
}

export const RAW_MOTOR_PORT_VALUE_PARSER: InjectionToken<IRawMotorPortValueParser> = Symbol('RAW_MOTOR_PORT_VALUE_PARSER');
