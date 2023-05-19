import { ConsoleLogger } from './console-logger';
import { LogLevel } from '../constants';

export class PrefixedConsoleLogger extends ConsoleLogger {
    private prefix: string;

    constructor(
        prefix: string,
        logLevel: LogLevel,
    ) {
        super(logLevel);
        this.prefix = `[${prefix}] \t`;
    }

    public override debug(
        ...debug: unknown[]
    ): void {
        super.debug(this.prefix, ...debug);
    }

    public override info(
        ...info: unknown[]
    ): void {
        super.info(this.prefix, ...info);
    }

    public override warn(
        ...warning: unknown[]
    ): void {
        super.warn(this.prefix, ...warning);
    }

    public override error(
        error: Error | string
    ): void {
        super.error(error);
    }
}
