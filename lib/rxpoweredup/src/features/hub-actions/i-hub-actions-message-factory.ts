import { InjectionToken } from 'tsyringe';

import { RawMessage } from '../../types';
import { MessageType } from '../../constants';

export interface IHubActionsMessageFactory {
  createDisconnectMessage(): RawMessage<MessageType.action>;

  createSwitchOffMessage(): RawMessage<MessageType.action>;
}

export const HUB_ACTIONS_MESSAGE_FACTORY: InjectionToken<IHubActionsMessageFactory> =
  Symbol('HUB_ACTIONS_MESSAGE_FACTORY');
