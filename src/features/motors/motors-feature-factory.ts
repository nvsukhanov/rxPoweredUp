import { InjectionToken, inject, injectable } from 'tsyringe';

import { MotorsFeature } from './motors-feature';
import { HubConfig, IMotorsFeature, IMotorsFeatureFactory, IOutboundMessenger, IPortValueTransformer, IRawPortValueProvider } from '../../hub';
import { IMotorCommandsOutboundMessageFactory, PORT_OUTPUT_COMMAND_MESSAGE_FACTORY } from './i-motor-commands-outbound-message-factory';

export const MOTOR_APOS_VALUE_TRANSFORMER: InjectionToken<IPortValueTransformer<number>> = Symbol('MOTOR_APOS_VALUE_TRANSFORMER');
export const MOTOR_POS_VALUE_TRANSFORMER: InjectionToken<IPortValueTransformer<number>> = Symbol('MOTOR_POS_VALUE_TRANSFORMER');

@injectable()
export class MotorsFeatureFactory implements IMotorsFeatureFactory {
    constructor(
        @inject(PORT_OUTPUT_COMMAND_MESSAGE_FACTORY) private readonly messageFactory: IMotorCommandsOutboundMessageFactory,
        @inject(MOTOR_APOS_VALUE_TRANSFORMER) private readonly motorAposValueTransformer: IPortValueTransformer<number>,
        @inject(MOTOR_POS_VALUE_TRANSFORMER) private readonly motorPosValueTransformer: IPortValueTransformer<number>,
    ) {
    }

    public createCommandsFeature(
        messenger: IOutboundMessenger,
        portValueProvider: IRawPortValueProvider,
        config: HubConfig
    ): IMotorsFeature {
        return new MotorsFeature(
            messenger,
            this.messageFactory,
            portValueProvider,
            this.motorAposValueTransformer,
            this.motorPosValueTransformer,
            config
        );
    }
}
