import { Observable } from 'rxjs';

import { IChannel } from '../i-channel';
import { IDisposable, RawMessage } from '../../../types';
import { ITaskVisitor } from './i-task-visitor';
import { MessageType } from '../../../constants';

export interface IQueueTask<TResult> extends IDisposable {
  readonly result: Observable<TResult>;

  readonly message: RawMessage<MessageType>;

  discard(): void;

  emitError(error: Error): void;

  accept(visitor: ITaskVisitor): void;

  execute(channel: IChannel): Observable<unknown>;
}
