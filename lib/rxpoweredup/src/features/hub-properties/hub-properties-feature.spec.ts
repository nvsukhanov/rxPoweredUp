import { Observable, Subject, Subscription, of } from 'rxjs';
import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito';

import { HubPropertiesFeature } from './hub-properties-feature';
import { IHubPropertiesMessageFactory } from './i-hub-properties-message-factory';
import { IOutboundMessenger } from '../../hub';
import type { HubPropertyInboundMessage, ILogger, RawMessage } from '../../types';
import { IHubPropertiesFeatureErrorsFactory } from './i-hub-properties-feature-errors-factory';
import { HubProperty, MessageType, SubscribableHubProperties } from '../../constants';

describe('HubPropertiesFeature', () => {
  let messageFactoryServiceMock: IHubPropertiesMessageFactory;
  let messengerMock: IOutboundMessenger;
  let loggerMock: ILogger;
  let inboundMessages: Subject<HubPropertyInboundMessage>;
  let errorsFactoryMock: IHubPropertiesFeatureErrorsFactory;
  let onDisconnected$: Subject<void>;
  let subject: HubPropertiesFeature;

  let subscription: Subscription;

  beforeEach(() => {
    messageFactoryServiceMock = mock<IHubPropertiesMessageFactory>();
    messengerMock = mock<IOutboundMessenger>();
    loggerMock = mock<ILogger>();
    inboundMessages = new Subject<HubPropertyInboundMessage>();
    errorsFactoryMock = mock<IHubPropertiesFeatureErrorsFactory>();
    onDisconnected$ = new Subject<void>();
    subject = new HubPropertiesFeature(
      instance(messageFactoryServiceMock),
      instance(messengerMock),
      instance(loggerMock),
      inboundMessages,
      instance(errorsFactoryMock),
      onDisconnected$
    );

    subscription = new Subscription();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  const SUBSCRIBABLE_TEST_DATA: Array<{
    propertyType: SubscribableHubProperties;
    getStream: () => Observable<unknown>;
    messageSample: HubPropertyInboundMessage;
    isMessageValueValid: (value: unknown) => boolean;
  }> = [
    {
      propertyType: HubProperty.button,
      getStream: (): Observable<boolean> => subject.buttonState,
      messageSample: {
        messageType: MessageType.properties,
        propertyType: HubProperty.button,
        isPressed: 'foobar' as unknown as boolean,
      },
      isMessageValueValid: (isPressed: unknown): boolean => isPressed === 'foobar',
    },
    {
      propertyType: HubProperty.batteryVoltage,
      getStream: (): Observable<number> => subject.batteryLevel,
      messageSample: {
        messageType: MessageType.properties,
        propertyType: HubProperty.batteryVoltage,
        level: -42,
      },
      isMessageValueValid: (level: unknown): boolean => level === -42,
    },
    {
      propertyType: HubProperty.RSSI,
      getStream: (): Observable<number> => subject.rssiLevel,
      messageSample: {
        messageType: MessageType.properties,
        propertyType: HubProperty.RSSI,
        level: 456,
      },
      isMessageValueValid: (level: unknown): boolean => level === 456,
    },
  ];

  SUBSCRIBABLE_TEST_DATA.forEach(({ propertyType, getStream, messageSample, isMessageValueValid }) => {
    describe(`${HubProperty[propertyType]} stream`, () => {
      let subscribeMessage: RawMessage<MessageType.properties>;
      let unsubscribeMessage: RawMessage<MessageType.properties>;

      beforeEach(() => {
        subscribeMessage = {} as unknown as RawMessage<MessageType.properties>;
        unsubscribeMessage = {} as unknown as RawMessage<MessageType.properties>;
        when(messageFactoryServiceMock.createSubscriptionMessage(propertyType)).thenReturn(subscribeMessage);
        when(messageFactoryServiceMock.createUnsubscriptionMessage(propertyType)).thenReturn(unsubscribeMessage);
        when(messengerMock.sendWithoutResponse(subscribeMessage)).thenReturn(of(void 0));
        when(messengerMock.sendWithoutResponse(unsubscribeMessage)).thenReturn(of(void 0));
      });

      it('should not send subscription message before first subscription', () => {
        const target = getStream();
        expect(target).not.toBe(undefined);
        verify(messengerMock.sendWithoutResponse(anything())).never();
      });

      it('should send subscription message on first subscription', () => {
        subscription.add(getStream().subscribe());
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).once();
      });

      it('should propagate inbound buttonState messages to subscribers', (done) => {
        const consumersCount = 3;
        let correctReceptions = 0;

        function onCorrectReception(): void {
          correctReceptions++;
          if (correctReceptions === consumersCount) {
            done();
          }
        }

        for (let i = 0; i < consumersCount; i++) {
          subscription.add(
            getStream().subscribe((r) => {
              if (isMessageValueValid(r)) {
                onCorrectReception();
              }
            })
          );
        }
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).once();
        inboundMessages.next(messageSample);
      });

      it('should not send multiple subscription messages when multiple consumers subscribes to a single observable', () => {
        const r = getStream().subscribe();
        subscription.add(r);
        subscription.add(r);
        subscription.add(r);
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).once();
      });

      it('should not send multiple subscription messages when multiple consumers subscribes to multiple observables', () => {
        subscription.add(getStream().subscribe());
        subscription.add(getStream().subscribe());
        subscription.add(getStream().subscribe());
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).once();
      });

      it('should send unsubscription message when last consumer unsubscribes', () => {
        const consumerA = getStream().subscribe();
        const consumerB = getStream().subscribe();
        const consumerC = getStream().subscribe();
        subscription.add(consumerA);
        subscription.add(consumerB);
        subscription.add(consumerC);
        consumerA.unsubscribe();
        verify(messengerMock.sendWithoutResponse(unsubscribeMessage)).never();
        consumerB.unsubscribe();
        verify(messengerMock.sendWithoutResponse(unsubscribeMessage)).never();
        consumerC.unsubscribe();
        verify(messengerMock.sendWithoutResponse(unsubscribeMessage)).once();
      });

      it('should send subscription message when consumer subscribes after unsubscribing', () => {
        const consumerA = getStream().subscribe();
        const consumerB = getStream().subscribe();
        consumerA.unsubscribe();
        consumerB.unsubscribe();
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).once();
        verify(messengerMock.sendWithoutResponse(unsubscribeMessage)).once();
        const consumerC = getStream().subscribe();
        verify(messengerMock.sendWithoutResponse(subscribeMessage)).twice();
        consumerC.unsubscribe();
        verify(messengerMock.sendWithoutResponse(unsubscribeMessage)).twice();
      });

      it('should not make attempt to unsubscribe from a property is hub is already disconnected', () => {
        const consumer = getStream().subscribe();
        resetCalls(messengerMock);
        onDisconnected$.next();
        consumer.unsubscribe();
        verify(messengerMock.sendWithoutResponse(anything())).never();
      });
    });
  });
});
