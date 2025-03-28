import { inject, injectable } from 'tsyringe';

import { HubScanner } from './hub-scanner';
import type { IHubScannerErrorFactory } from './i-hub-scanner-error-factory';
import { HUB_SCANNER_ERROR_FACTORY } from './i-hub-scanner-error-factory';
import { IHubScanner } from './i-hub-scanner';

@injectable()
export class HubScannerFactory {
  constructor(@inject(HUB_SCANNER_ERROR_FACTORY) private readonly hubScannerErrorFactory: IHubScannerErrorFactory) {}

  public create(bluetooth: Bluetooth): IHubScanner {
    return new HubScanner(this.hubScannerErrorFactory, bluetooth);
  }
}
