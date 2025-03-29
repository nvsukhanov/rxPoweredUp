import { InjectionToken } from 'tsyringe';

import { RawPortOutputCommandMessage } from '../../types';
import { ColorDescriptor } from '../../hub';

export interface IRgbLightCommandsFactory {
  createSetRgbColorCommand(port: number, modeId: number, color: ColorDescriptor): RawPortOutputCommandMessage;
}

export const RGB_LIGHT_COMMANDS_FACTORY: InjectionToken<IRgbLightCommandsFactory> =
  Symbol('RGB_LIGHT_COMMANDS_FACTORY');
