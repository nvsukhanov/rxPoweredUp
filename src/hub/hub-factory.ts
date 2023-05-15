import { inject, injectable } from 'tsyringe';
import { NEVER, Observable } from 'rxjs';
import { Logger } from 'tslog';

import { Hub } from './hub';
import { BluetoothDeviceWithGatt, ILegoHubConfig, LEGO_HUB_CONFIG } from '../types';
import { ConnectionErrorFactory } from '../errors';
import { CHARACTERISTIC_DATA_STREAM_FACTORY, ICharacteristicDataStreamFactory } from './i-characteristic-data-stream-factory';
import { IMessageMiddleware } from './i-message-middleware';
import { IHub } from './i-hub';
import { IOutboundMessengerFactory, OUTBOUND_MESSAGE_FACTORY } from './i-outbound-messenger-factory';
import { HUB_PROPERTY_FEATURE_FACTORY, IHubPropertiesFeatureFactory } from './i-hub-properties-feature-factory';
import { COMMANDS_FEATURE_FACTORY, ICommandsFeatureFactory } from './i-commands-feature-factory';
import { IIoFeatureFactory, IO_FEATURE_FACTORY } from './i-io-feature-factory';

@injectable()
export class HubFactory {
    constructor(
        @inject(LEGO_HUB_CONFIG) private readonly config: ILegoHubConfig,
        private readonly connectionErrorFactory: ConnectionErrorFactory,
        @inject(OUTBOUND_MESSAGE_FACTORY) private readonly outboundMessengerFactory: IOutboundMessengerFactory,
        @inject(HUB_PROPERTY_FEATURE_FACTORY) private readonly hubPropertiesFactory: IHubPropertiesFeatureFactory,
        @inject(IO_FEATURE_FACTORY) private readonly ioFeatureFactoryService: IIoFeatureFactory,
        @inject(CHARACTERISTIC_DATA_STREAM_FACTORY) private readonly characteristicsDataStreamFactory: ICharacteristicDataStreamFactory,
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
            new Logger({ name: device.name ?? device.id }),
            this.config,
            this.connectionErrorFactory,
            this.outboundMessengerFactory,
            this.hubPropertiesFactory,
            this.ioFeatureFactoryService,
            this.characteristicsDataStreamFactory,
            this.commandsFeatureFactory,
            incomingMessageMiddleware,
            outgoingMessageMiddleware,
            externalDisconnectEvents$
        );
    }
}
