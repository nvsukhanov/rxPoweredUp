import { Hub } from './hub';
import { HubLoggerFactory } from '../logging';
import { BluetoothDeviceWithGatt, ILegoHubConfig, LEGO_HUB_CONFIG } from '../types';
import { ConnectionErrorFactory } from '../errors';
import { CharacteristicDataStreamFactory, OutboundMessengerFactory } from '../messages';
import { HubPropertiesFeatureFactory, IoFeatureFactory, MotorFeatureFactory } from '../features';
import { inject, injectable } from 'tsyringe';
import { IMessageMiddleware } from '../middleware';
import { NEVER, Observable } from 'rxjs';
import { IHub } from './i-hub';

@injectable()
export class HubFactory {
    constructor(
        private readonly hubLoggerFactory: HubLoggerFactory,
        @inject(LEGO_HUB_CONFIG) private readonly config: ILegoHubConfig,
        private readonly connectionErrorFactory: ConnectionErrorFactory,
        private readonly outboundMessengerFactoryService: OutboundMessengerFactory,
        private readonly propertiesFactoryService: HubPropertiesFeatureFactory,
        private readonly ioFeatureFactoryService: IoFeatureFactory,
        private readonly characteristicsDataStreamFactoryService: CharacteristicDataStreamFactory,
        private readonly motorFeatureFactoryService: MotorFeatureFactory,
    ) {
    }

    public create(
        device: BluetoothDeviceWithGatt,
        incomingMessageMiddleware: IMessageMiddleware[] = [],
        outgoingMessageMiddleware: IMessageMiddleware[] = [],
        externalDisconnectEvents$: Observable<unknown> = NEVER
    ): IHub {
        return new Hub(
            device,
            this.hubLoggerFactory.createHubLogger(device.name ?? device.id),
            this.config,
            this.connectionErrorFactory,
            this.outboundMessengerFactoryService,
            this.propertiesFactoryService,
            this.ioFeatureFactoryService,
            this.characteristicsDataStreamFactoryService,
            this.motorFeatureFactoryService,
            incomingMessageMiddleware,
            outgoingMessageMiddleware,
            externalDisconnectEvents$
        );
    }
}
