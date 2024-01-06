/* eslint-disable no-console */
import { ILogger } from '../types';
import { LogLevel } from '../constants';

export class ConsoleLogger implements ILogger {
    constructor(
        private readonly configuredLogLevel: LogLevel,
    ) {
    }

    public debug(...debug: unknown[]): void {
        if (this.canWrite(LogLevel.Debug)) {
            console.debug(...debug);
        }
    }

    public log(...args: unknown[]): void {
        if (this.canWrite(LogLevel.Debug)) {
            console.log(...args);
        }
    }

    public info(...info: unknown[]): void {
        if (this.canWrite(LogLevel.Info)) {
            console.info(...info);
        }

    }

    public warn(...warning: unknown[]): void {
        if (this.canWrite(LogLevel.Warning)) {
            console.warn(...warning);
        }
    }

    public error(error: Error | string): void {
        if (this.canWrite(LogLevel.Error)) {
            console.error(error);
        }
    }

    private canWrite(level: LogLevel): boolean {
        return level >= this.configuredLogLevel;
    }
}
