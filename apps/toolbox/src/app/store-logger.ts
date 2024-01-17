import { ILogger, LogLevel } from 'rxpoweredup';

export class StoreLogger implements ILogger {
    constructor(
        private logMessageFn: (logLevel: LogLevel, message: string) => void
    ) {
    }

    public debug(...args: unknown[]): void {
        this.logMessageFn(LogLevel.Debug, args.join(' '));
    }

    public error(e: unknown): void {
        this.logMessageFn(LogLevel.Error, e?.toString() ?? 'Unknown error');
    }

    public log(...args: unknown[]): void {
        this.logMessageFn(LogLevel.Info, args.join(' '));
    }

    public warn(...args: unknown[]): void {
        this.logMessageFn(LogLevel.Warning, args.join(' '));
    }
}
