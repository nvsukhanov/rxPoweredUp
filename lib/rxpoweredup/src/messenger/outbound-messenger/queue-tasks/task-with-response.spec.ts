import { instance, mock, verify, when } from 'ts-mockito';
import { Subject, Subscription } from 'rxjs';

import { TaskWithResponse } from './task-with-response';
import { RawMessage } from '../../../types';
import { OutboundMessageTypes } from '../../../constants';
import { IChannel } from '../i-channel';

describe('TaskWithResponse', () => {
  let subject: TaskWithResponse<symbol>;
  let responsesStream: Subject<symbol>;
  let message: RawMessage<OutboundMessageTypes>;
  let channelMock: IChannel;
  let subscription: Subscription;
  let result: symbol;

  beforeEach(() => {
    responsesStream = new Subject<symbol>();
    message = {} as RawMessage<OutboundMessageTypes>;
    channelMock = mock<IChannel>();
    subscription = new Subscription();
    result = Symbol();
    when(channelMock.sendMessage(message)).thenResolve();
    subject = new TaskWithResponse<symbol>(message, responsesStream);
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should not send message before subscriber subscribes', () => {
    subject.execute(instance(channelMock));
    verify(channelMock.sendMessage(message)).never();
  });

  it('should send message on execute subscribe', () => {
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    verify(channelMock.sendMessage(message)).once();
  });

  it('should complete result on discard', (done) => {
    subscription.add(
      subject.result.subscribe({
        complete: done,
      })
    );
    subject.discard();
  });

  it('should re-send message on second execute if no result has been received', () => {
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    verify(channelMock.sendMessage(message)).twice();
  });

  it('should not send message on execute if result has been received', () => {
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    responsesStream.next(result);
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    verify(channelMock.sendMessage(message)).once();
  });

  it('should emit result on execute', (done) => {
    subscription.add(
      subject.result.subscribe((value) => {
        expect(value).toBe(result);
        done();
      })
    );
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    responsesStream.next(result);
  });

  it('should capture early response (before the message send promise is resolved)', (done) => {
    let resolveHandler: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveHandler = resolve;
    });
    subscription.add(
      subject.result.subscribe((value) => {
        expect(value).toBe(result);
        resolveHandler();
        done();
      })
    );
    when(channelMock.sendMessage(message)).thenReturn(promise);
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    responsesStream.next(result);
  });

  it('should not re-send message if early response has been received', () => {
    let resolveHandler: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveHandler = resolve;
    });
    subscription.add(
      subject.result.subscribe(() => {
        resolveHandler();
      })
    );
    when(channelMock.sendMessage(message)).thenReturn(promise);
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    responsesStream.next(result);
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    verify(channelMock.sendMessage(message)).once();
  });
});
