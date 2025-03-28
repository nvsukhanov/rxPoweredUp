export interface ILogger {
  debug(...args: unknown[]): void;

  log(...args: unknown[]): void;

  warn(...args: unknown[]): void;

  error(e: unknown): void;
}
