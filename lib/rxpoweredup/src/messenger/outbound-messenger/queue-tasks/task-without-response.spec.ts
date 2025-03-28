import { instance, mock, verify, when } from 'ts-mockito';
import { Subscription } from 'rxjs';

import { TaskWithoutResponse } from './task-without-response';
import { RawMessage } from '../../../types';
import { OutboundMessageTypes } from '../../../constants';
import { IChannel } from '../i-channel';

describe('TaskWithoutResponse', () => {
  let subject: TaskWithoutResponse;
  let message: RawMessage<OutboundMessageTypes>;
  let channelMock: IChannel;
  let subscription: Subscription;

  beforeEach(() => {
    message = {} as RawMessage<OutboundMessageTypes>;
    channelMock = mock<IChannel>();
    when(channelMock.sendMessage(message)).thenResolve();
    subscription = new Subscription();
    subject = new TaskWithoutResponse(message);
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should not send message before subscriber subscribes', () => {
    subject.execute(instance(channelMock));
    verify(channelMock.sendMessage(message)).never();
  });

  it('should send message on execute', () => {
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

  it('should re-send message on second execute if no result has been received', (done) => {
    let resolveHandler: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveHandler = resolve;
    });

    when(channelMock.sendMessage(message))
      .thenCall(() => promise)
      .thenResolve();
    subscription.add(
      subject.result.subscribe({
        complete: () => {
          verify(channelMock.sendMessage(message)).twice();
          resolveHandler();
          done();
        },
      })
    );
    subscription.add(subject.execute(instance(channelMock)).subscribe());
    subscription.add(subject.execute(instance(channelMock)).subscribe());
  });
});
