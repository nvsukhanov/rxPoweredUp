import { injectable } from 'tsyringe';

import { IVirtualPortSetupMessageFactory } from '../../features';
import { RawMessage } from '../../types';
import { MessageType, VirtualPortSetupCommand } from '../../constants';

@injectable()
export class VirtualPortSetupOutboundMessageFactory implements IVirtualPortSetupMessageFactory {
  public createVirtualPort(portIdA: number, portIdB: number): RawMessage<MessageType.virtualPortSetup> {
    return {
      header: {
        messageType: MessageType.virtualPortSetup,
      },
      payload: Uint8Array.from([VirtualPortSetupCommand.Connect, portIdA, portIdB]),
    };
  }

  public deleteVirtualPort(virtualPortId: number): RawMessage<MessageType.virtualPortSetup> {
    return {
      header: {
        messageType: MessageType.virtualPortSetup,
      },
      payload: Uint8Array.from([VirtualPortSetupCommand.Disconnect, virtualPortId]),
    };
  }
}
