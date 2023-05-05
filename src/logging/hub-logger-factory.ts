import { injectable } from 'tsyringe';
import { Logger } from 'tslog';
import { ILogger } from './i-logger';

@injectable()
export class HubLoggerFactory {
    public createHubLogger(
        deviceId: string
    ): ILogger {
        return new Logger({ name: deviceId });
    }
}
