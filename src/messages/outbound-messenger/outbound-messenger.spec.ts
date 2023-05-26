import 'reflect-metadata';
import { NEVER, Subject, Subscription, TimeoutError, catchError, of } from 'rxjs';
import { instance, mock, verify, when } from 'ts-mockito';

import { OutboundMessenger } from './outbound-messenger';
import { ILogger, PortOutputCommandFeedbackInboundMessage, RawMessage, RawPortOutputCommandMessage } from '../../types';
import { PacketBuilder } from './packet-builder';
import { MessageType, OutboundMessageTypes } from '../../constants';
import { concatUint8Arrays } from '../../helpers';
import { PortOutputCommandFeedbackReplyParser } from '../reply-parsers';
import { OutboundMessengerConfig, PortCommandExecutionStatus } from '../../hub';

jest.useFakeTimers();

function createPortOutputCommandMessage(id: number): RawPortOutputCommandMessage {
    return {
        id,
        header: {
            messageType: MessageType.portOutputCommand
        },
        portId: 0,
        payload: Uint8Array.from([])
    } as unknown as RawPortOutputCommandMessage;
}

function createGenericMessage(id: number): RawMessage<OutboundMessageTypes> {
    return {
        id,
        header: {
            messageType: MessageType.properties
        },
        payload: Uint8Array.from([])
    } as RawMessage<OutboundMessageTypes>;
}

function convertFeedbackReply(portId: number, payload: Uint8Array): PortOutputCommandFeedbackInboundMessage {
    const message: RawMessage<MessageType.portOutputCommandFeedback> = {
        header: {
            messageType: MessageType.portOutputCommandFeedback
        },
        payload: concatUint8Arrays(Uint8Array.from([ portId ]), payload)
    };
    const parser = new PortOutputCommandFeedbackReplyParser();
    return parser.parseMessage(message);
}

describe('OutboundMessenger', () => {
    let subject: OutboundMessenger;
    let portOutputCommandFeedbackStream: Subject<PortOutputCommandFeedbackInboundMessage>;
    let characteristicMock: BluetoothRemoteGATTCharacteristic;
    let packetBuilderMock: PacketBuilder;
    let loggerMock: ILogger;
    let config: OutboundMessengerConfig;
    let subs: Subscription[];

    beforeEach(() => {
        subs = [];
        portOutputCommandFeedbackStream = new Subject();
        characteristicMock = mock<BluetoothRemoteGATTCharacteristic>();
        packetBuilderMock = mock(PacketBuilder);
        loggerMock = mock<ILogger>();

        config = {
            maxMessageSendRetries: 5,
            messageSendTimeout: 5,
            outgoingMessageMiddleware: []
        };

        subject = new OutboundMessenger(
            portOutputCommandFeedbackStream,
            NEVER,
            instance(characteristicMock),
            instance(packetBuilderMock),
            [],
            instance(loggerMock),
            config
        );
    });

    afterEach(() => {
        subs.forEach((s) => s.unsubscribe());
        subs = [];
    });

    /*
     * Test for halting issue:
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x01
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x05
     * out message type '0x81 (portOutputCommand)', payload 0x01 0x11 0x0d 0x00 0x00 0x00 0x00 0x64 0x64 0x7e 0x00
     * in message type '0x82 (portOutputCommandFeedback)', payload 0x01 0x0e
     * Then messenger halts and does not send any more messages.
     */
    it('should not halt when 0x0e feedback is received', (done) => {
        const firstReplies: PortCommandExecutionStatus[] = [];
        const secondReplies: PortCommandExecutionStatus[] = [];
        const thirdReplies: PortCommandExecutionStatus[] = [];
        const fourthReplies: PortCommandExecutionStatus[] = [];

        const firstMessage = createPortOutputCommandMessage(1);
        const secondMessage = createPortOutputCommandMessage(2);
        const thirdMessage = createPortOutputCommandMessage(3);
        const fourthMessage = createPortOutputCommandMessage(4);

        const firstPacket = Symbol() as unknown as Uint8Array;
        const secondPacket = Symbol() as unknown as Uint8Array;
        const thirdPacket = Symbol() as unknown as Uint8Array;
        const fourthPacket = Symbol() as unknown as Uint8Array;

        const firstResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(firstMessage.portId, Uint8Array.from([ 0x01 ])));
        const secondResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(secondMessage.portId, Uint8Array.from([ 0x05 ])));
        const thirdResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(thirdMessage.portId, Uint8Array.from([ 0x0e ])));
        const fourthResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(fourthMessage.portId, Uint8Array.from([ 0x01 ])));
        const fifthResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(thirdMessage.portId, Uint8Array.from([ 0x10 ])));

        when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
        when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);
        when(packetBuilderMock.buildPacket(thirdMessage)).thenReturn(thirdPacket);
        when(packetBuilderMock.buildPacket(fourthMessage)).thenReturn(fourthPacket);

        when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenResolve();
        when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenResolve();

        when(characteristicMock.writeValueWithoutResponse(thirdPacket)).thenResolve();

        when(characteristicMock.writeValueWithoutResponse(fourthPacket)).thenResolve();

        subs.push(subject.sendPortOutputCommand(firstMessage).subscribe((v) => firstReplies.push(v)));
        firstResponseHandle();
        subs.push(subject.sendPortOutputCommand(secondMessage).subscribe((v) => secondReplies.push(v)));
        secondResponseHandle();
        subs.push(subject.sendPortOutputCommand(thirdMessage).subscribe((v) => thirdReplies.push(v)));
        thirdResponseHandle();
        subs.push(subject.sendPortOutputCommand(fourthMessage).subscribe({
            next: (v) => fourthReplies.push(v),
            complete: () => {
                expect(firstReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.discarded ]);
                expect(secondReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.discarded ]);
                expect(thirdReplies).toEqual([ PortCommandExecutionStatus.completed ]);
                expect(fourthReplies).toEqual([ PortCommandExecutionStatus.inProgress, PortCommandExecutionStatus.completed ]);
                done();
            }
        }));
        fourthResponseHandle();
        fifthResponseHandle();
    });

    describe('sendPortOutputCommand', () => {
        it('should not wait for the previous command to reach it`s terminal state before sending the next command', (done) => {
            const firstMessage = createPortOutputCommandMessage(1);
            const secondMessage = createPortOutputCommandMessage(2);

            const firstPacket = Symbol() as unknown as Uint8Array;
            const secondPacket = Symbol() as unknown as Uint8Array;

            const firstResponseHandle = (): void => portOutputCommandFeedbackStream.next(convertFeedbackReply(firstMessage.portId, Uint8Array.from([ 0x01 ])));

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);

            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenResolve();
            when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenCall(() => done()).thenCall(() => Promise.resolve());

            subs.push(subject.sendPortOutputCommand(firstMessage).subscribe({
                next: () => subs.push(subject.sendPortOutputCommand(secondMessage).subscribe({
                    error: (e) => {
                        if (!(e instanceof TimeoutError)) {
                            throw e;
                        }
                    }
                })),
                error: (e) => {
                    if (!(e instanceof TimeoutError)) {
                        throw e;
                    }
                }
            }));
            firstResponseHandle();
        });

        it('should retry sending the command if the reply was not received', (done) => {
            const firstMessage = createPortOutputCommandMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenResolve();
            subs.push(subject.sendPortOutputCommand(firstMessage).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(TimeoutError);
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
            jest.advanceTimersByTime(config.messageSendTimeout * (config.maxMessageSendRetries + 1));
        });

        it('should retry sending the command on error', (done) => {
            const firstMessage = createPortOutputCommandMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test3'));
            subs.push(subject.sendPortOutputCommand(firstMessage).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(Error);
                    expect((e as Error).message).toBe('test3');
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
        });

        it('should execute next command if the previous one was executed with error', (done) => {
            const firstMessage = createPortOutputCommandMessage(1);
            const secondMessage = createPortOutputCommandMessage(2);

            const firstPacket = Symbol() as unknown as Uint8Array;
            const secondPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);

            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test4'));
            when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenCall(() => done()).thenCall(() => Promise.resolve());

            subs.push(subject.sendPortOutputCommand(firstMessage).pipe(
                catchError(() => of(null))
            ).subscribe());
            subs.push(subject.sendPortOutputCommand(secondMessage).subscribe({
                error: (e) => {
                    if (!(e instanceof TimeoutError)) {
                        throw e;
                    }
                }
            }));
        });

        it('should not execute task before someone subscribes to the observable', () => {
            let isSent = false;
            const firstMessage = createPortOutputCommandMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;
            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenCall(() => {
                isSent = true;
                return Promise.resolve();
            });

            const p = subject.sendPortOutputCommand(firstMessage);
            expect(isSent).toBeFalsy();
            subs.push(p.subscribe());
            expect(isSent).toBeTruthy();
        });
    });

    describe('sendWithResponse', () => {
        it('should retry sending the command if the reply was not received', (done) => {
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenResolve();
            subs.push(subject.sendWithResponse({ message: firstMessage, reply: NEVER }).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(TimeoutError);
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
            jest.advanceTimersByTime(config.messageSendTimeout * (config.maxMessageSendRetries + 1));
        });

        it('should retry sending the command on error', (done) => {
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test1'));
            subs.push(subject.sendWithResponse({ message: firstMessage, reply: NEVER }).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(Error);
                    expect((e as Error).message).toBe('test1');
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
        });

        it('should execute next command if the previous one was executed with error', (done) => {
            const firstMessage = createGenericMessage(1);
            const secondMessage = createGenericMessage(2);

            const firstPacket = Symbol() as unknown as Uint8Array;
            const secondPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);

            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test2'));
            when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenCall(() => done()).thenCall(() => Promise.resolve());

            subs.push(subject.sendWithResponse({ message: firstMessage, reply: NEVER }).pipe(
                catchError(() => of(null))
            ).subscribe());
            subs.push(subject.sendWithResponse({ message: secondMessage, reply: NEVER }).pipe(
                catchError(() => of(null))
            ).subscribe());
        });

        it('should not execute task before someone subscribes to the observable', () => {
            let isSent = false;
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;
            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenCall(() => {
                isSent = true;
                return Promise.resolve();
            });

            const p = subject.sendWithResponse({ message: firstMessage, reply: NEVER });
            expect(isSent).toBeFalsy();
            subs.push(p.subscribe());
            expect(isSent).toBeTruthy();
        });

        it('should send multiple commands in order, returning the response of the last one', (done) => {
            const replies: unknown[] = [];
            const messageSendOrder: Array<RawMessage<OutboundMessageTypes>> = [];
            const expectedReply = Symbol();
            const firstMessage = createGenericMessage(1);
            const secondMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;
            const secondPacket = Symbol() as unknown as Uint8Array;

            const firstResponseStream = new Subject<number>();
            const secondResponseStream = new Subject<symbol>();

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenCall(() => {
                messageSendOrder.push(firstMessage);
                return Promise.resolve();
            });

            when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);
            when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenCall(() => {
                messageSendOrder.push(secondMessage);
                return Promise.resolve();
            });

            subject.sendWithResponse(
                { message: firstMessage, reply: firstResponseStream },
                { message: secondMessage, reply: secondResponseStream }
            ).subscribe({
                next: (v) => replies.push(v),
                complete: () => {
                    expect(replies).toEqual([ expectedReply ]);
                    expect(messageSendOrder).toEqual([ firstMessage, secondMessage ]);
                    done();
                }
            });

            firstResponseStream.next(1);
            secondResponseStream.next(expectedReply);
        });
    });

    describe('sendWithoutResponse', () => {
        it('should retry sending the command if the reply was not received', (done) => {
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenCall(() => new Promise(() => {
                // do nothing
            }));
            subs.push(subject.sendWithoutResponse(firstMessage).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(TimeoutError);
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
            jest.advanceTimersByTime(config.messageSendTimeout * (config.maxMessageSendRetries + 1));
        });

        it('should retry sending the command on error', (done) => {
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test1'));
            subs.push(subject.sendWithoutResponse(firstMessage).subscribe({
                error: (e) => {
                    expect(e).toBeInstanceOf(Error);
                    expect((e as Error).message).toBe('test1');
                    verify(characteristicMock.writeValueWithoutResponse(firstPacket)).times(config.maxMessageSendRetries + 1);
                    done();
                }
            }));
        });

        it('should execute next command if the previous one was executed with error', (done) => {
            const firstMessage = createGenericMessage(1);
            const secondMessage = createGenericMessage(2);

            const firstPacket = Symbol() as unknown as Uint8Array;
            const secondPacket = Symbol() as unknown as Uint8Array;

            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(packetBuilderMock.buildPacket(secondMessage)).thenReturn(secondPacket);

            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenThrow(new Error('test2'));
            when(characteristicMock.writeValueWithoutResponse(secondPacket)).thenCall(() => done()).thenCall(() => Promise.resolve());

            subs.push(subject.sendWithoutResponse(firstMessage).pipe(
                catchError(() => of(null))
            ).subscribe());
            subs.push(subject.sendWithoutResponse(secondMessage).subscribe());
        });

        it('should not execute sendWithoutResponse task before someone subscribes to the observable', () => {
            let isSent = false;
            const firstMessage = createGenericMessage(1);

            const firstPacket = Symbol() as unknown as Uint8Array;
            when(packetBuilderMock.buildPacket(firstMessage)).thenReturn(firstPacket);
            when(characteristicMock.writeValueWithoutResponse(firstPacket)).thenCall(() => {
                isSent = true;
                return Promise.resolve();
            });

            const p = subject.sendWithoutResponse(firstMessage);
            expect(isSent).toBeFalsy();
            subs.push(p.subscribe());
            expect(isSent).toBeTruthy();
        });
    });
});
