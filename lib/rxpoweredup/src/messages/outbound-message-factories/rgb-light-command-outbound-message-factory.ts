import { injectable } from 'tsyringe';

import { IRgbLightCommandsFactory } from '../../features';
import { ColorDescriptor } from '../../hub';
import { RawPortOutputCommandMessage } from '../../types';
import { MessageType, OutputSubCommand, PortOperationCompletionInformation, PortOperationStartupInformation, } from '../../constants';

@injectable()
export class RgbLightCommandOutboundMessageFactory implements IRgbLightCommandsFactory {
    public createSetRgbColorCommand(
        portId: number,
        modeId: number,
        color: ColorDescriptor
    ): RawPortOutputCommandMessage {
        this.ensureColorIsValid(color);
        return {
            header: {
                messageType: MessageType.portOutputCommand
            },
            portId,
            payload: new Uint8Array([
                portId,
                PortOperationStartupInformation.bufferIfNecessary | PortOperationCompletionInformation.commandFeedback,
                OutputSubCommand.writeDirectModeData,
                modeId,
                color.red,
                color.green,
                color.blue
            ]),
            waitForFeedback: true
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
