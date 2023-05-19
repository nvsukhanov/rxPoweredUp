import { InjectionToken } from 'tsyringe';

import { ILogger } from '../types';
import { LogLevel } from '../constants';

export interface IPrefixedConsoleLoggerFactory {
    createLogger(
        prefix: string,
        logLevel: LogLevel
    ): ILogger;
}

export const PREFIXED_CONSOLE_LOGGER_FACTORY: InjectionToken<IPrefixedConsoleLoggerFactory> = Symbol('PREFIXED_CONSOLE_LOGGER_FACTORY');
