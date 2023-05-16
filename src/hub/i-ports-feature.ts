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

export interface IPortsFeature {
    /**
     * Emits when an io device is attached to a port.
     * If portId is not specified, it will emit for all ports.
     * Events are cached, so if you subscribe after an io device is attached, you will still get the event.
     * @param portId
     */
    onIoAttach(
        portId?: number
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;

    /**
     * Emits when an io device is detached from a port.
     * If portId is not specified, it will emit for all ports.
     * @param portId
     */
    onIoDetach(
        portId?: number
    ): Observable<AttachedIODetachInboundMessage>;

    /**
     * Reads the value of a port for a given mode.
     * modeId specifies the mode to read the value from (see requestPortModeInformation)
     * portModeName specifies value parsing method.
     * In order to read value of a port, you need to know the modeId and portModeName, which can be obtained by calling requestPortModes
     * and requestPortModeInformation. For example, to read the absolute position of a motor, you need to call requestPortModes,
     * then requestPortModeInformation with modeId from the previous call and PortModeInformationType.name, and then call requestPortValue
     * with modeId from the first call and PortModeName.absolutePosition.
     * OR
     * It seems like it is possible to use well-known modeIds and portModeNames, e.g. 0 and 'absolutePosition' for motors.
     * But this method is fragile and may not work for all devices and be broken in future firmware versions.
     * @param portId
     * @param modeId
     * @param portModeName
     */
    requestPortValue(
        portId: number,
        modeId: number,
        portModeName: PortModeName
    ): Observable<PortValueInboundMessage>;

    /**
     * Reads port modes and capabilities for a given port.
     * @param portId
     */
    requestPortModes(
        portId: number
    ): Observable<PortModeInboundMessage>;

    /**
     * Reads information about a given mode for a given port (e.g. mode name ('absolutePosition', 'speed', etc.))
     * @param portId
     * @param mode
     * @param modeInformationType
     */
    requestPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }>;
}
