import { Observable, filter, map, shareReplay } from 'rxjs';

import { IHubActionsFeature, IOutboundMessenger } from '../../hub';
import { HubActionInboundMessage } from '../../types';
import { HubActionType } from '../../constants';
import { IHubActionsMessageFactory } from './i-hub-actions-message-factory';

export class HubActionsFeature implements IHubActionsFeature {
  public readonly willDisconnect: Observable<void>;

  public readonly willSwitchOff: Observable<void>;

  constructor(
    private readonly hubActionsMessageFactory: IHubActionsMessageFactory,
    private readonly messenger: IOutboundMessenger,
    inboundMessages: Observable<HubActionInboundMessage>
  ) {
    this.willDisconnect = inboundMessages.pipe(
      filter((m) => m.actionType === HubActionType.willDisconnect),
      map(() => void 0),
      shareReplay(1)
    );
    this.willSwitchOff = inboundMessages.pipe(
      filter((m) => m.actionType === HubActionType.willSwitchOff),
      map(() => void 0),
      shareReplay(1)
    );
  }

  public disconnect(): Observable<void> {
    const message = this.hubActionsMessageFactory.createDisconnectMessage();
    return this.messenger.sendWithoutResponse(message);
  }

  public switchOff(): Observable<void> {
    const message = this.hubActionsMessageFactory.createSwitchOffMessage();
    return this.messenger.sendWithoutResponse(message);
  }
}
