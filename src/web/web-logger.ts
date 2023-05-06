/* eslint-disable */
import { ILogger } from '../logging';

export class WebLogger implements ILogger {
    constructor(
        private readonly prefix: string = ''
    ) {
    }

    public debug(...args: unknown[]): void {
        console.debug(this.prefix, ...args);
    }

    public error(...args: unknown[]): void {
        console.error(this.prefix, ...args);
    }

    public log(...args: unknown[]): void {
        console.log(this.prefix, ...args);
    }

    public warn(...args: unknown[]): void {
        console.warn(this.prefix, ...args);
    }
}
