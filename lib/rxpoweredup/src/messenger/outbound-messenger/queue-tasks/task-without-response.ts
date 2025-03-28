import { Observable, Subject, from, of, switchMap, tap } from 'rxjs';

import { IQueueTask, ITaskVisitor } from '../queue';
import { RawMessage } from '../../../types';
import { OutboundMessageTypes } from '../../../constants';
import { IChannel } from '../i-channel';

/**
 * This class represents a task that is responsible for sending a single message to the hub that is not expected to receive a response.
 * e.g. setting a hub name
 */
export class TaskWithoutResponse implements IQueueTask<void> {
  public readonly result: Subject<void>;

  constructor(public readonly message: RawMessage<OutboundMessageTypes>) {
    this.result = new Subject<void>();
  }

  public discard(): void {
    this.result.complete();
  }

  public dispose(): void {
    return void 0;
  }

  public accept(visitor: ITaskVisitor): void {
    visitor.visitTaskWithoutResponse(this);
  }

  public emitError(error: Error): void {
    this.result.error(error);
  }

  public execute(channel: IChannel): Observable<unknown> {
    return of(null).pipe(
      switchMap(() => from(channel.sendMessage(this.message))),
      tap(() => {
        this.result.next();
        this.result.complete();
      })
    );
  }
}
