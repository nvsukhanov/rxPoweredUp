import { Observable, filter, map, take } from 'rxjs';

import { AttachIoEvent, PortModeInformationType } from '../../constants';
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
import { IRawPortValueProvider } from '../motors';
import { IVirtualPortSetupMessageFactory } from './i-virtual-port-setup-message-factory';

export class PortsFeature implements IPortsFeature, IRawPortValueProvider {
    constructor(
        private readonly portModeReplies$: Observable<PortModeInboundMessage>,
        private readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>,
        private readonly attachedIoCachedReplies$: Observable<AttachedIOInboundMessage>,
        private readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>,
        private readonly portValueSetupSingleHandshakeReplies$: Observable<PortInputSetupSingleHandshakeInboundMessage>,
        private readonly portInformationRequestMessageFactory: IPortInformationRequestMessageFactory,
        private readonly rawPortValueReplies: Observable<PortValueInboundMessage>,
        private readonly portModeInformationMessageFactory: IPortModeInformationRequestMessageFactory,
        private readonly portInputFormatSetupMessageFactory: IPortInputFormatSetupMessageFactory,
        private readonly virtualPortSetupMessageFactory: IVirtualPortSetupMessageFactory,
        private readonly messenger: IOutboundMessenger,
    ) {
    }

    public onIoAttach(
        portId?: number
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage> {
        return this.attachedIoCachedReplies$.pipe(
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
        return this.attachedIoCachedReplies$.pipe(
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

    public getRawPortValue(
        portId: number,
        modeId: number,
    ): Observable<number[]> {
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

        return this.messenger.sendWithResponse(
            { message: setPortInputFormatMessage, reply: portValueHandshakeReplies$ },
            { message: portValueRequestMessage, reply: this.rawPortValueReplies }
        ).pipe(
            map((r) => r.value)
        );
    }

    public getPortModes(
        portId: number
    ): Observable<PortModeInboundMessage> {
        return this.messenger.sendWithResponse({
            message: this.portInformationRequestMessageFactory.createPortModeRequest(portId),
            reply: this.portModeReplies$.pipe(
                filter((r) => r.portId === portId)
            )
        });
    }

    public getPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }> {
        const message = this.portModeInformationMessageFactory.createPortModeInformationRequest(
            portId,
            mode,
            modeInformationType
        );

        const reply = (this.portModeInformationReplies$ as Observable<PortModeInformationInboundMessage & { modeInformationType: T }>).pipe(
            filter((r) => r.modeInformationType === modeInformationType && r.portId === portId && r.mode === mode),
        );

        return this.messenger.sendWithResponse({ message, reply });
    }

    public createVirtualPort(
        portIdA: number,
        portIdB: number
    ): Observable<AttachedIOAttachVirtualInboundMessage> {
        const replies = this.attachedIoReplies$.pipe(
            filter((r) => r.event === AttachIoEvent.AttachedVirtual && r.portIdA === portIdA && r.portIdB === portIdB),
        );
        return this.messenger.sendWithResponse({
            message: this.virtualPortSetupMessageFactory.createVirtualPort(portIdA, portIdB),
            reply: replies
        });
    }

    public deleteVirtualPort(
        virtualPortId: number
    ): Observable<AttachedIODetachInboundMessage> {
        const replies = this.attachedIoReplies$.pipe(
            filter((r) => r.event === AttachIoEvent.Detached && r.portId === virtualPortId),
        );
        return this.messenger.sendWithResponse({
            message: this.virtualPortSetupMessageFactory.deleteVirtualPort(virtualPortId),
            reply: replies
        });
    }
}
