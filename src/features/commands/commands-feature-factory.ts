import { injectable } from 'tsyringe';

import { CommandsFeature } from './commands-feature';
import { IOutboundMessenger, OutputCommandOutboundMessageFactory } from '../../messages';
import { ICommandsFeature } from './i-commands-feature';

@injectable()
export class CommandsFeatureFactory {
    constructor(
        private readonly portOutputCommandOutboundMessageFactoryService: OutputCommandOutboundMessageFactory,
    ) {
    }

    public createCommandsFeature(
        messenger: IOutboundMessenger
    ): ICommandsFeature {
        return new CommandsFeature(
            messenger,
            this.portOutputCommandOutboundMessageFactoryService
        );
    }
}
