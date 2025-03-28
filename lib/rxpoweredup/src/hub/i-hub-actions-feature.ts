import { Observable } from 'rxjs';

export interface IHubActionsFeature {
  readonly willSwitchOff: Observable<void>;

  readonly willDisconnect: Observable<void>;

  switchOff(): Observable<void>;

  disconnect(): Observable<void>;
}
