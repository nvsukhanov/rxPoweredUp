import { InjectionToken } from 'tsyringe';

import { MessageType } from '../../constants';
import { RawMessage } from '../../types';

export interface IVirtualPortSetupMessageFactory {
  createVirtualPort(portIdA: number, portIdB: number): RawMessage<MessageType.virtualPortSetup>;

  deleteVirtualPort(virtualPortId: number): RawMessage<MessageType.virtualPortSetup>;
}

export const VIRTUAL_PORT_SETUP_MESSAGE_FACTORY: InjectionToken<IVirtualPortSetupMessageFactory> = Symbol(
  'VIRTUAL_PORT_SETUP_MESSAGE_FACTORY'
);
