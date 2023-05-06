import { Observable, exhaustMap, filter, share } from 'rxjs';

import {
    IInboundMessageListener,
    IOutboundMessenger,
    PortInformationRequestOutboundMessageFactory,
    PortInputFormatSetupSingleOutboundMessageFactory,
    PortModeInformationRequestOutboundMessageFactory,
} from '../../messages';
import { MessageType, PortModeInformationType, PortModeName } from '../../constants';
import { AttachedIoRepliesCacheFactory } from './attached-io-replies-cache-factory';
import { IoFeaturePortValueListenerFactory } from './io-feature-port-value-listener-factory';
import { AttachedIOInboundMessage, PortModeInboundMessage, PortModeInformationInboundMessage, PortValueInboundMessage } from '../../types';
import { IIoFeature } from './i-io-feature';

export class IoFeature implements IIoFeature {
    public readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>;

    public readonly portModeReplies$: Observable<PortModeInboundMessage>;

    public readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>;

    private portValueStreamMap = new Map<string, Observable<PortValueInboundMessage>>();

    private portValueModeState = new Map<number, number>();

    constructor(
        private readonly messageFactoryService: PortInformationRequestOutboundMessageFactory,
        private readonly portModeInboundMessageListener: IInboundMessageListener<MessageType.portInformation>,
        private readonly portValueInboundListenerFactory: IoFeaturePortValueListenerFactory,
        private readonly attachedIOInboundMessageListener: IInboundMessageListener<MessageType.attachedIO>,
        private readonly portModeInformationInboundMessageListener: IInboundMessageListener<MessageType.portModeInformation>,
        private readonly portModeInformationOutboundMessageFactoryService: PortModeInformationRequestOutboundMessageFactory,
        private readonly portInputFormatSetupSingleOutboundMessageFactoryService: PortInputFormatSetupSingleOutboundMessageFactory,
        private readonly messenger: IOutboundMessenger,
        private readonly attachedIoRepliesCacheFactoryService: AttachedIoRepliesCacheFactory,
        private readonly onDisconnected$: Observable<void>,
    ) {
        this.portModeInformationReplies$ = this.portModeInformationInboundMessageListener.replies$.pipe(
            share()
        );

        this.portModeReplies$ = this.portModeInboundMessageListener.replies$.pipe(
            share()
        );

        const cache = this.attachedIoRepliesCacheFactoryService.create(
            this.attachedIOInboundMessageListener.replies$,
            this.onDisconnected$,
        );
        this.attachedIoReplies$ = cache.replies$.pipe(
            share()
        );
    }

    public getPortValue$(
        portId: number,
        modeId: number,
        portModeName: PortModeName
    ): Observable<PortValueInboundMessage> {
        // ensure there are no active subscriptions for this port with different mode
        const existingPortModeState = this.portValueModeState.get(portId);
        if (existingPortModeState && existingPortModeState !== modeId) {
            throw new Error(`Unable to get port ${portId} mode values for mode ${modeId}:
             there are already active subscription for mode ${existingPortModeState}`);
        }

        // retrieve cached stream if any
        const portModeHash = `${portId}/${modeId}`;
        const existingStream = this.portValueStreamMap.get(portModeHash);
        if (existingStream) {
            return existingStream;
        }

        // will throw if no listener can be created for this mode
        const messageReplyListener = this.portValueInboundListenerFactory.createForMode(
            portModeName
        );

        const stream: Observable<PortValueInboundMessage> = new Observable((subscriber) => {
            const setPortInputFormatMessage = this.portInputFormatSetupSingleOutboundMessageFactoryService.createMessage(
                portId,
                modeId,
                false,
            );
            const portValueRequestMessage = this.messageFactoryService.createPortValueRequest(portId);

            // setting up port input format
            // since we have share() operator below, this will be executed only once per port/mode
            const sub = this.messenger.sendWithoutResponse$(setPortInputFormatMessage).pipe(
                // requesting port value
                // since we have share() operator below, this will be executed only once per port/mode
                exhaustMap(() => this.messenger.sendAndReceive$(portValueRequestMessage, messageReplyListener.replies$)),
            ).subscribe((v) => {
                this.portValueModeState.delete(portId);
                this.portValueStreamMap.delete(portModeHash);
                subscriber.next(v);
                subscriber.complete();
            });
            return () => {
                this.portValueModeState.delete(portId);
                this.portValueStreamMap.delete(portModeHash);
                sub.unsubscribe();
            };
        });

        const result = stream.pipe(share());
        // each new subscriptions will create guarded stream of replies and store it in cache
        this.portValueModeState.set(portId, modeId);
        this.portValueStreamMap.set(portModeHash, result);

        return result;
    }

    public getPortModes$(
        portId: number
    ): Observable<PortModeInboundMessage> {
        return this.messenger.sendAndReceive$(
            this.messageFactoryService.createPortModeRequest(portId),
            this.portModeReplies$.pipe(
                filter((r) => r.portId === portId)
            )
        );
    }

    public getPortModeInformation$<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }> {
        const portModeRequestMessage = this.portModeInformationOutboundMessageFactoryService.createPortModeInformationRequest(
            portId,
            mode,
            modeInformationType
        );

        const replies$ = (this.portModeInformationReplies$ as Observable<PortModeInformationInboundMessage & { modeInformationType: T }>).pipe(
            filter((r) => r.modeInformationType === modeInformationType && r.portId === portId && r.mode === mode),
        );

        return this.messenger.sendAndReceive$(
            portModeRequestMessage,
            replies$
        );
    }
}
