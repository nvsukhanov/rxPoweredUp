import { inject, injectable } from 'tsyringe';

import { IRgbLightCommandsFactory } from '../../features';
import { ColorDescriptor } from '../../hub';
import { RawPortOutputCommandMessage } from '../../types';
import { MessageType, PortOperationCompletionInformation, PortOperationStartupInformation } from '../../constants';
import { WriteDirectModeDataBuilder } from './write-direct-mode-data-builder';

@injectable()
export class RgbLightCommandOutboundMessageFactory implements IRgbLightCommandsFactory {
  constructor(
    @inject(WriteDirectModeDataBuilder) private readonly writeDirectModeDataBuilder: WriteDirectModeDataBuilder
  ) {}

  public createSetRgbColorCommand(portId: number, modeId: number, color: ColorDescriptor): RawPortOutputCommandMessage {
    this.ensureColorIsValid(color);
    return {
      header: {
        messageType: MessageType.portOutputCommand,
      },
      portId,
      payload: this.writeDirectModeDataBuilder.buildWriteDirectModeData({
        portId,
        startupInformation: PortOperationStartupInformation.bufferIfNecessary,
        completionInformation: PortOperationCompletionInformation.commandFeedback,
        modeId,
        payload: [color.red, color.green, color.blue],
      }),
      waitForFeedback: true,
    };
  }

  private ensureColorIsValid(color: ColorDescriptor): void {
    if (color.red < 0 || color.red > 255) {
      throw new Error('Invalid red value');
    }
    if (color.green < 0 || color.green > 255) {
      throw new Error('Invalid green value');
    }
    if (color.blue < 0 || color.blue > 255) {
      throw new Error('Invalid blue value');
    }
  }
}
