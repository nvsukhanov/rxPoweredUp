import { InjectionToken } from 'tsyringe';

export interface IRawMotorPortValueParser {
    parseAbsolutePosition(rawPortValue: number[]): number;

    parsePosition(rawPortValue: number[]): number;

    parseSpeed(rawPortValue: number[]): number;
}

export const RAW_MOTOR_PORT_VALUE_PARSER: InjectionToken<IRawMotorPortValueParser> = Symbol('RAW_MOTOR_PORT_VALUE_PARSER');
