import { instance, mock, verify, when } from 'ts-mockito';
import { take } from 'rxjs';

import { PortOutputCommandTaskState, TaskPortOutputCommand } from './task-port-output-command';
import { RawPortOutputCommandMessage } from '../../../types';
import { PortCommandExecutionStatus } from '../../../hub';
import { IChannel } from '../i-channel';

describe('TaskPortOutputCommand', () => {
    let message: RawPortOutputCommandMessage;
    let portId: number;
    let subject: TaskPortOutputCommand;

    beforeEach(() => {
        portId = Symbol() as unknown as number;
        message = {
            portId,
            waitForFeedback: true
        } as RawPortOutputCommandMessage;
        subject = new TaskPortOutputCommand(message);
    });

    describe('portId', () => {
        it('should return portId', () => {
            expect(subject.portId).toBe(portId);
        });
    });

    describe('state', () => {
        it('should return pending', () => {
            expect(subject.state).toBe(PortOutputCommandTaskState.pending);
        });

        it('should return waitingForResponse', () => {
            subject.state = PortOutputCommandTaskState.waitingForResponse;
            expect(subject.state).toBe(PortOutputCommandTaskState.waitingForResponse);
        });

        it('should return inProgress', () => {
            subject.state = PortOutputCommandTaskState.waitingForResponse;
            subject.state = PortOutputCommandTaskState.inProgress;
            expect(subject.state).toBe(PortOutputCommandTaskState.inProgress);
        });

        it('should throw error when invalid state transition', () => {
            subject.state = PortOutputCommandTaskState.waitingForResponse;
            expect(() => subject.state = PortOutputCommandTaskState.pending).toThrowError();
        });
    });

    describe('discard', () => {
        it('should complete result', (done) => {
            subject.result.subscribe({
                complete: () => done()
            });
            subject.discard();
        });
    });

    describe('emitError', () => {
        it('should emit error', (done) => {
            const error = new Error();
            subject.result.subscribe({
                error: (e) => {
                    expect(e).toBe(error);
                    done();
                }
            });
            subject.emitError(error);
        });
    });

    describe('setExecutionStatus', () => {
        it('should emit status', (done) => {
            const status = Symbol() as unknown as number;
            subject.result.subscribe({
                next: (s) => {
                    expect(s).toBe(status);
                    done();
                }
            });
            subject.setExecutionStatus(status);
        });

        [ PortCommandExecutionStatus.discarded, PortCommandExecutionStatus.executionError, PortCommandExecutionStatus.completed ].forEach((status) => {
            it(`should complete result when terminal status ${PortCommandExecutionStatus[status]} is reached`, (done) => {
                subject.result.subscribe({
                    complete: () => done()
                });
                subject.setExecutionStatus(status);
            });
        });
    });

    describe('execute', () => {
        it('should send message to channel when subscribed', (done) => {
            const channelMock = mock<IChannel>();
            when(channelMock.sendMessage(message)).thenResolve();
            const e = subject.execute(instance(channelMock));
            verify(channelMock.sendMessage(message)).never();
            e.pipe(
                take(1)
            ).subscribe(() => {
                verify(channelMock.sendMessage(message)).once();
                done();
            });
            subject.setExecutionStatus(PortCommandExecutionStatus.inProgress);
        });

        // Sometimes sendMessage resolves AFTER the response is received. This is why we need to start listening to response before sending the message.
        it('should start listen to response before request is sent and when waitForFeedback is true', (done) => {
            message.waitForFeedback = true;
            const channelMock = mock<IChannel>();
            let resolveFn: () => void = () => void 0;
            const promise = new Promise<void>((resolve) => {
                resolveFn = resolve;
            });
            when(channelMock.sendMessage(message)).thenReturn(promise);

            const e = subject.execute(instance(channelMock));
            subject.setExecutionStatus(PortCommandExecutionStatus.inProgress);
            verify(channelMock.sendMessage(message)).never();
            e.pipe(
                take(1)
            ).subscribe(() => {
                verify(channelMock.sendMessage(message)).once();
                done();
            });
            expect(subject.state).toBe(PortOutputCommandTaskState.waitingForResponse);
            resolveFn();
        });
    });
});
