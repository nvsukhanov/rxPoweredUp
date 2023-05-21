import { Observable, exhaustMap, filter, share, take } from 'rxjs';

import { MessageType, PortModeInformationType, PortModeName } from '../../constants';
import { PortsFeaturePortValueListenerFactory } from './ports-feature-port-value-listener-factory';
import {
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIOInboundMessage,
    AttachedIoAttachInboundMessage,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortValueInboundMessage
} from '../../types';
import { IOutboundMessenger, IPortsFeature } from '../../hub';
import { IPortInformationRequestMessageFactory } from './i-port-information-request-message-factory';
import { IPortModeInformationRequestMessageFactory } from './i-port-mode-information-request-message-factory';
import { IPortInputFormatSetupMessageFactory } from './i-port-input-format-setup-message-factory';
import { IPortValueProvider } from '../motors';

export class PortsFeature implements IPortsFeature, IPortValueProvider {
    private portValueStreamMap = new Map<string, Observable<PortValueInboundMessage>>();

    private portValueModeState = new Map<number, number>();

    constructor(
        private readonly portModeReplies$: Observable<PortModeInboundMessage>,
        private readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>,
        private readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>,
        private readonly portInformationRequestMessageFactory: IPortInformationRequestMessageFactory,
        private readonly portValueInboundListenerFactory: PortsFeaturePortValueListenerFactory,
        private readonly portModeInformationMessageFactory: IPortModeInformationRequestMessageFactory,
        private readonly portInputFormatSetupMessageFactory: IPortInputFormatSetupMessageFactory,
        private readonly messenger: IOutboundMessenger,
    ) {
    }

    public onIoAttach(
        portId?: number
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage> {
        return this.attachedIoReplies$.pipe(
            filter((message) => {
                if (portId === undefined) {
                    return message.messageType === MessageType.attachedIO;
                }
                return message.portId === portId;
            })
        ) as Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;
    }

    public onIoDetach(portId?: number): Observable<AttachedIODetachInboundMessage> {
        return this.attachedIoReplies$.pipe(
            filter((message) => {
                    if (portId === undefined) {
                        return message.messageType === MessageType.attachedIO;
                    }
                    return message.portId === portId;
                }
            )) as Observable<AttachedIODetachInboundMessage>;
    }

    public getPortValue<T extends PortModeName>(
        portId: number,
        modeId: number,
        portModeName: T
    ): Observable<PortValueInboundMessage & { modeName: T }> {
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
            return existingStream as Observable<PortValueInboundMessage & { modeName: T }>;
        }

        // will throw if no listener can be created for this mode
        const portValueReplies$ = this.portValueInboundListenerFactory.createForMode(
            portModeName
        );

        const stream: Observable<PortValueInboundMessage> = new Observable((subscriber) => {
            const setPortInputFormatMessage = this.portInputFormatSetupMessageFactory.createMessage(
                portId,
                modeId,
                false,
            );
            const portValueRequestMessage = this.portInformationRequestMessageFactory.createPortValueRequest(portId);

            // setting up port input format
            // since we have share() operator below, this will be executed only once per port/mode
            const sub = this.messenger.sendWithoutResponse(setPortInputFormatMessage).pipe(
                // requesting port value
                // since we have share() operator below, this will be executed only once per port/mode
                exhaustMap(() => this.messenger.sendWithResponse(portValueRequestMessage, portValueReplies$)),
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

        return result as Observable<PortValueInboundMessage & { modeName: T }>;
    }

    public getPortModes(
        portId: number
    ): Observable<PortModeInboundMessage> {
        return this.messenger.sendWithResponse(
            this.portInformationRequestMessageFactory.createPortModeRequest(portId),
            this.portModeReplies$.pipe(
                filter((r) => r.portId === portId),
                take(1)
            )
        );
    }

    public getPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }> {
        const portModeRequestMessage = this.portModeInformationMessageFactory.createPortModeInformationRequest(
            portId,
            mode,
            modeInformationType
        );

        const replies$ = (this.portModeInformationReplies$ as Observable<PortModeInformationInboundMessage & { modeInformationType: T }>).pipe(
            filter((r) => r.modeInformationType === modeInformationType && r.portId === portId && r.mode === mode),
        );

        return this.messenger.sendWithResponse(
            portModeRequestMessage,
            replies$
        );
    }
}
