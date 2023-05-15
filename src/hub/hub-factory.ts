import { inject, injectable } from 'tsyringe';
import { NEVER, Observable } from 'rxjs';

import { Hub } from './hub';
import { HubLoggerFactory } from '../logging';
import { BluetoothDeviceWithGatt, ILegoHubConfig, LEGO_HUB_CONFIG } from '../types';
import { ConnectionErrorFactory } from '../errors';
import { CharacteristicDataStreamFactory } from '../messages';
import { IMessageMiddleware } from '../middleware';
import { IHub } from './i-hub';
import { IOutboundMessengerFactory, OUTBOUND_MESSAGE_FACTORY } from './i-outbound-messenger-factory';
import { HUB_PROPERTY_FEATURE_FACTORY, IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { COMMANDS_FEATURE_FACTORY, ICommandsFeatureFactory } from './i-commands-feature-factory';
import { IIoFeatureFactory, IO_FEATURE_FACTORY } from './i-io-feature-factory';

@injectable()
export class HubFactory {
    constructor(
        private readonly hubLoggerFactory: HubLoggerFactory,
        @inject(LEGO_HUB_CONFIG) private readonly config: ILegoHubConfig,
        private readonly connectionErrorFactory: ConnectionErrorFactory,
        @inject(OUTBOUND_MESSAGE_FACTORY) private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        @inject(HUB_PROPERTY_FEATURE_FACTORY) private readonly hubPropertiesFactory: IHubPropertiesFeatureFactory,
        @inject(IO_FEATURE_FACTORY) private readonly ioFeatureFactoryService: IIoFeatureFactory,
        private readonly characteristicsDataStreamFactoryService: CharacteristicDataStreamFactory,
        @inject(COMMANDS_FEATURE_FACTORY) private readonly commandsFeatureFactory: ICommandsFeatureFactory,
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
            this.outboundMessengerFactory,
            this.hubPropertiesFactory,
            this.ioFeatureFactoryService,
            this.characteristicsDataStreamFactoryService,
            this.commandsFeatureFactory,
            incomingMessageMiddleware,
            outgoingMessageMiddleware,
            externalDisconnectEvents$
        );
    }
}
