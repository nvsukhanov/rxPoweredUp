import 'reflect-metadata';

import { instance, mock, when } from 'ts-mockito';
import { Subject, take } from 'rxjs';

import { OutboundMessenger } from './outbound-messenger';
import { MessageType } from '../../constants';
import { RawMessage } from '../../types';
import { PacketBuilder } from './packet-builder';

function createMessage(): RawMessage<MessageType> {
    return {
        header: {
            messageType: MessageType.properties,
        },
        payload: Uint8Array.from([ 0x01, 0x02, 0x03 ]),
    };
}

describe('OutboundMessenger', () => {
    let subject: OutboundMessenger;
    let packerBuilderMock: PacketBuilder;
    let characteristicMock: BluetoothRemoteGATTCharacteristic;

    function registerOutboundMessageReply(
        message: RawMessage<MessageType>,
        replyFn: () => void
    ): void {
        const packet = Symbol() as unknown as Uint8Array;
        when(packerBuilderMock.buildPacket(message)).thenReturn(packet);
        when(characteristicMock.writeValueWithoutResponse(packet)).thenCall(() => {
            // setTimeout is used here to simulate delayed response from device
            // it is guaranteed that the replyFn will be called after the characteristicMock.writeValueWithoutResponse promise is resolved
            // also there should be a better way than using setTimeout in tests (it seems like fakeTimers from jest does not fit here)
            setTimeout(() => {
                replyFn();
            }, 0);

            return Promise.resolve();
        });
    }

    beforeEach(() => {
        characteristicMock = mock<BluetoothRemoteGATTCharacteristic>();
        packerBuilderMock = mock(PacketBuilder);
        subject = new OutboundMessenger(
            instance(characteristicMock),
            instance(packerBuilderMock),
            []
        );
    });

    describe('sendWithoutResponse', () => {
        it('should execute single message', (done) => {
            const message = createMessage();
            registerOutboundMessageReply(message, done);
            subject.sendWithoutResponse(message);
        });

        it('should execute multiple messages in order', (done) => {
            const message1 = createMessage();
            const message2 = createMessage();
            const message3 = createMessage();

            const messagesSent: number[] = [];

            registerOutboundMessageReply(message1, () => {
                messagesSent.push(1);
            });
            registerOutboundMessageReply(message2, () => {
                messagesSent.push(2);
            });
            registerOutboundMessageReply(message3, () => {
                expect(messagesSent).toEqual([ 1, 2 ]);
                done();
            });

            subject.sendWithoutResponse(message1);
            subject.sendWithoutResponse(message2);
            subject.sendWithoutResponse(message3);
        });

        it('should execute multiple messages in order with delay', (done) => {
            const message1 = createMessage();
            const message2 = createMessage();
            const message3 = createMessage();

            const messagesSent: number[] = [];

            registerOutboundMessageReply(message1, () => {
                messagesSent.push(1);
            });
            registerOutboundMessageReply(message2, () => {
                messagesSent.push(2);
            });
            registerOutboundMessageReply(message3, () => {
                expect(messagesSent).toEqual([ 1, 2 ]);
                done();
            });

            subject.sendWithoutResponse(message1);
            setTimeout(() => {
                subject.sendWithoutResponse(message2);
            }, 1);
            setTimeout(() => {
                subject.sendWithoutResponse(message3);
            }, 2);
        });

        it('should resume execution after error', (done) => {
            const message1 = createMessage();
            const message2 = createMessage();

            const message1Packet = Symbol() as unknown as Uint8Array;
            when(packerBuilderMock.buildPacket(message1)).thenReturn(message1Packet);

            when(characteristicMock.writeValueWithoutResponse(message1Packet)).thenReturn(Promise.reject());
            registerOutboundMessageReply(message2, () => {
                done();
            });
            subject.sendWithoutResponse(message1);
            setTimeout(() => {
                subject.sendWithoutResponse(message2);
            }, 2);
        });
    });

    describe('sendWithResponse', () => {
        describe('with single message', () => {
            let message: RawMessage<MessageType>;
            let messageOutboundStream: Subject<number>;

            beforeEach(() => {
                message = createMessage();
                messageOutboundStream = new Subject();
                registerOutboundMessageReply(message, () => messageOutboundStream.next(1));
            });

            it('should execute single message', (done) => {
                subject.sendWithResponse(
                    message,
                    messageOutboundStream.pipe(take(1))
                ).subscribe((r) => {
                    expect(r).toBe(1);
                    done();
                });
            });

            it('should complete outer observable when inner observable completes', (done) => {
                subject.sendWithResponse(
                    message,
                    messageOutboundStream.pipe(take(1))
                ).subscribe({
                    complete: done
                });
            });

            it('should emit values until the response stream completes', (done) => {
                const values: number[] = [];

                registerOutboundMessageReply(message, () => {
                    setTimeout(() => {
                        messageOutboundStream.next(1);
                    }, 0);
                    setTimeout(() => {
                        messageOutboundStream.next(2);
                    }, 1);
                    setTimeout(() => {
                        messageOutboundStream.next(3);
                        messageOutboundStream.complete();
                    }, 3);
                });

                subject.sendWithResponse(
                    message,
                    messageOutboundStream
                ).subscribe({
                    next: (v) => {
                        values.push(v);
                    },
                    complete: () => {
                        expect(values).toEqual([ 1, 2, 3 ]);
                        done();
                    }
                });
            });
        });

        describe('with multiple messages', () => {
            let message1: RawMessage<MessageType>;
            let message2: RawMessage<MessageType>;
            let message3: RawMessage<MessageType>;
            let message1OutboundStream: Subject<number>;
            let message2OutboundStream: Subject<number>;
            let message3OutboundStream: Subject<number>;

            beforeEach(() => {
                message1 = createMessage();
                message2 = createMessage();
                message3 = createMessage();
                message1OutboundStream = new Subject();
                message2OutboundStream = new Subject();
                message3OutboundStream = new Subject();
            });

            it('should execute multiple messages in order', (done) => {
                registerOutboundMessageReply(message1, () => void 0);
                registerOutboundMessageReply(message2, () => void 0);
                registerOutboundMessageReply(message3, () => void 0);
                const values: number[] = [];

                subject.sendWithResponse(
                    message1,
                    message1OutboundStream.pipe(take(1))
                ).subscribe({
                    next: (v) => {
                        values.push(v);
                    }
                });

                subject.sendWithResponse(
                    message2,
                    message2OutboundStream.pipe(take(1))
                ).subscribe({
                    next: (v) => {
                        values.push(v);
                    }
                });

                subject.sendWithResponse(
                    message3,
                    message3OutboundStream.pipe(take(1))
                ).subscribe({
                    next: (v) => {
                        values.push(v);
                    }
                });

                setTimeout(() => {
                    message1OutboundStream.next(1);
                    expect(values).toEqual([ 1 ]);
                    setTimeout(() => {
                        message2OutboundStream.next(2);
                        expect(values).toEqual([ 1, 2 ]);
                        setTimeout(() => {
                            message3OutboundStream.next(3);
                            expect(values).toEqual([ 1, 2, 3 ]);
                            done();
                        }, 0);
                    }, 0);
                }, 0);
            });

            it('should resume tasks execution if one of the tasks fails', (done) => {
                const error = new Error('test error');
                registerOutboundMessageReply(message1, () => message1OutboundStream.error(error));
                registerOutboundMessageReply(message2, () => message2OutboundStream.next(2));

                let errorReceived = false;

                subject.sendWithResponse(message1, message1OutboundStream.pipe(take(1))).subscribe({
                    error: (e) => {
                        if (e === error) {
                            errorReceived = true;
                        }
                    }
                });

                subject.sendWithResponse(message2, message2OutboundStream.pipe(take(1))).subscribe({
                    next: (v) => {
                        expect(v).toBe(2);
                        expect(errorReceived).toBe(true);
                        done();
                    }
                });
            });

            it('should resume execution if task is added after queue was emptied', (done) => {
                registerOutboundMessageReply(message1, () => message1OutboundStream.next(2));
                registerOutboundMessageReply(message2, () => message2OutboundStream.next(2));

                subject.sendWithResponse(message1, message1OutboundStream.pipe(take(1))).subscribe({
                    complete: () => {
                        setTimeout(() => {
                            subject.sendWithResponse(message2, message2OutboundStream.pipe(take(1))).subscribe({
                                next: (v) => {
                                    expect(v).toBe(2);
                                    done();
                                }
                            });
                        }, 0);
                    }
                });
            });
        });
    });
});
