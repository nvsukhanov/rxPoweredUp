import { inject, injectable } from 'tsyringe';

import { IOutboundMessenger, IRgbLightFeature, IRgbLightFeatureFactory } from '../../hub';
import { RgbLightFeature } from './rgb-light-feature';
import type { IRgbLightCommandsFactory } from './i-rgb-light-commands-factory';
import { RGB_LIGHT_COMMANDS_FACTORY } from './i-rgb-light-commands-factory';
import type { IPortInputFormatSetupMessageFactory } from '../i-port-input-format-setup-message-factory';
import { PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY } from '../i-port-input-format-setup-message-factory';

@injectable()
export class RgbLightFeatureFactory implements IRgbLightFeatureFactory {
    constructor(
        @inject(RGB_LIGHT_COMMANDS_FACTORY) private readonly ledCommandsFactory: IRgbLightCommandsFactory,
        @inject(PORT_INPUT_FORMAT_SETUP_MESSAGE_FACTORY) private readonly portInputSetupMessageFactory: IPortInputFormatSetupMessageFactory
    ) {
    }

    public createFeature(
        messenger: IOutboundMessenger
    ): IRgbLightFeature {
        return new RgbLightFeature(
            messenger,
            this.ledCommandsFactory,
            this.portInputSetupMessageFactory
        );
    }
}
