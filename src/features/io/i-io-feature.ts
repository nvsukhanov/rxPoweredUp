import { Observable } from 'rxjs';
import { AttachedIOInboundMessage, PortModeInboundMessage, PortModeInformationInboundMessage, PortValueInboundMessage } from '../../types';
import { PortModeInformationType, PortModeName } from '../../constants';

export interface IIoFeature {
    readonly attachedIoReplies$: Observable<AttachedIOInboundMessage>;
    readonly portModeReplies$: Observable<PortModeInboundMessage>;
    readonly portModeInformationReplies$: Observable<PortModeInformationInboundMessage>;

    getPortValue$(
        portId: number,
        modeId: number,
        portModeName: PortModeName
    ): Observable<PortValueInboundMessage>;

    getPortModes$(
        portId: number
    ): Observable<PortModeInboundMessage>;

    getPortModeInformation$<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }>;
}
