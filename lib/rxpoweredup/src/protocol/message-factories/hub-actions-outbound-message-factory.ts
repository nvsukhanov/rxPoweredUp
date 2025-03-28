import { IHubActionsMessageFactory } from '../../features';
import { HubActionType, MessageType } from '../../constants';
import { RawMessage } from '../../types';

export class HubActionsOutboundMessageFactory implements IHubActionsMessageFactory {
  public createDisconnectMessage(): RawMessage<MessageType.action> {
    return {
      header: {
        messageType: MessageType.action,
      },
      payload: Uint8Array.from([HubActionType.disconnect]),
    };
  }

  public createSwitchOffMessage(): RawMessage<MessageType.action> {
    return {
      header: {
        messageType: MessageType.action,
      },
      payload: Uint8Array.from([HubActionType.switchOff]),
    };
  }
}
