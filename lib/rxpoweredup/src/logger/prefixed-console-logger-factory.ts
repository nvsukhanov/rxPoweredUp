import { injectable } from 'tsyringe';

import type { ILogger } from '../types';
import { PrefixedConsoleLogger } from './prefixed-console-logger';
import { LogLevel } from '../constants';
import { IPrefixedConsoleLoggerFactory } from '../hub';

@injectable()
export class PrefixedConsoleLoggerFactory implements IPrefixedConsoleLoggerFactory {
  public createLogger(prefix: string, logLevel: LogLevel): ILogger {
    return new PrefixedConsoleLogger(prefix, logLevel);
  }
}
