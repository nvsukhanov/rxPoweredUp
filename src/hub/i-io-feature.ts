import { Observable } from 'rxjs';

import {
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIoAttachInboundMessage,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortValueInboundMessage
} from '../types';
import { PortModeInformationType, PortModeName } from '../constants';

export interface IIoFeature {
    onIoAttach(
        portId?: number
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;

    onIoDetach(
        portId?: number
    ): Observable<AttachedIODetachInboundMessage>;

    getPortValue(
        portId: number,
        modeId: number,
        portModeName: PortModeName
    ): Observable<PortValueInboundMessage>;

    getPortModes(
        portId: number
    ): Observable<PortModeInboundMessage>;

    getPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }>;
}
