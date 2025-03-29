/* eslint-disable no-console */
import { ILogger, LogLevel } from 'rxpoweredup';

export class StoreLogger implements ILogger {
  constructor(
    private logMessageFn: (logLevel: LogLevel, message: string, id: string) => void,
    private readonly window: Window
  ) {}

  public debug(...args: unknown[]): void {
    console.debug(...args);
    this.logMessageFn(LogLevel.Debug, args.join(' '), this.window.crypto.randomUUID());
  }

  public error(e: unknown): void {
    console.error(e);
    this.logMessageFn(LogLevel.Error, e?.toString() ?? 'Unknown error', this.window.crypto.randomUUID());
  }

  public log(...args: unknown[]): void {
    console.log(...args);
    this.logMessageFn(LogLevel.Info, args.join(' '), this.window.crypto.randomUUID());
  }

  public warn(...args: unknown[]): void {
    console.warn(...args);
    this.logMessageFn(LogLevel.Warning, args.join(' '), this.window.crypto.randomUUID());
  }
}
