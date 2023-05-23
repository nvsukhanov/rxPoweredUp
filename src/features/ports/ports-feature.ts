import { Observable, concatWith, filter, last, take } from 'rxjs';

import { AttachIoEvent, PortModeInformationType, PortModeName } from '../../constants';
import { PortsFeaturePortValueListenerFactory } from './ports-feature-port-value-listener-factory';
import {
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIOInboundMessage,
    AttachedIoAttachInboundMessage,
    PortInputSetupSingleHandshakeInboundMessage,
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
    constructor(
        private readonly portModeReplies$: Observable<PortModeInboundMessage>,
        private readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>,
        private readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>,
        private readonly portValueSetupSingleHandshakeReplies$: Observable<PortInputSetupSingleHandshakeInboundMessage>,
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
                if (message.event !== AttachIoEvent.Attached && message.event !== AttachIoEvent.AttachedVirtual) {
                    return false;
                }
                if (portId !== undefined) {
                    return message.portId === portId;
                }
                return true;
            })
        ) as Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;
    }

    public onIoDetach(portId?: number): Observable<AttachedIODetachInboundMessage> {
        return this.attachedIoReplies$.pipe(
            filter((message) => {
                if (message.event !== AttachIoEvent.Detached) {
                    return false;
                }
                if (portId !== undefined) {
                    return message.portId === portId;
                }
                return true;
            })
        ) as Observable<AttachedIODetachInboundMessage>;
    }

    public getPortValue<T extends PortModeName>(
        portId: number,
        modeId: number,
        portModeName: T
    ): Observable<PortValueInboundMessage & { modeName: T }> {
        const setPortInputFormatMessage = this.portInputFormatSetupMessageFactory.createMessage(
            portId,
            modeId,
            false,
        );
        const portValueRequestMessage = this.portInformationRequestMessageFactory.createPortValueRequest(portId);

        const portValueHandshakeReplies$ = this.portValueSetupSingleHandshakeReplies$.pipe(
            filter((r) => r.portId === portId && r.modeId === modeId),
            take(1)
        );

        const portValueReplies$ = this.portValueInboundListenerFactory.createForMode(portModeName);

        // TODO: following messages must not be interrupted by other setPortInputFormat messages.
        return this.messenger.sendWithResponse(setPortInputFormatMessage, portValueHandshakeReplies$).pipe(
            concatWith(this.messenger.sendWithResponse(portValueRequestMessage, portValueReplies$)),
            last()
        ) as Observable<PortValueInboundMessage & { modeName: T }>;
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
