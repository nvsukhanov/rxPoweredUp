import { Observable } from 'rxjs';

import {
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIoAttachInboundMessage,
    PortModeInboundMessage,
    PortModeInformationInboundMessage
} from '../types';
import { AttachIoEvent, IOType, PortModeInformationType } from '../constants';

export type OnIoAttachFilter = {
    ports?: ReadonlyArray<number>;
    ioTypes?: ReadonlyArray<IOType>;
    eventTypes?: ReadonlyArray<AttachIoEvent.Attached | AttachIoEvent.AttachedVirtual>;
}

export type OnIoDetachFilter = {
    ports?: ReadonlyArray<number>;
}

export interface IPortsFeature {
    /**
     * Emits when an io device is attached to a port.
     * If portId is not specified, it will emit for all ports.
     * Events are cached, so if you subscribe after an io device is attached, you will still get the event.
     * @param filterOptions
     */
    onIoAttach(
        filterOptions?: OnIoAttachFilter
    ): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;

    /**
     * Emits when an io device is detached from a port.
     * If portId is not specified, it will emit for all ports.
     * @param filterOptions
     */
    onIoDetach(
        filterOptions?: OnIoDetachFilter
    ): Observable<AttachedIODetachInboundMessage>;

    /**
     * Reads raw port value for a given port and mode id.
     * Stream completes when the response is received from the hub.
     *
     * @param portId
     * @param modeId
     */
    getRawPortValue(
        portId: number,
        modeId: number
    ): Observable<number[]>;

    /**
     * Provides port value updates for a given port and mode id.
     *
     * @param portId
     * @param modeId
     * @param deltaThreshold If the difference between the current value and the previous value is less than this threshold, the value will not be emitted.
     */
    valueChanges(
        portId: number,
        modeId: number,
        deltaThreshold: number
    ): Observable<number[]>;

    /**
     * Reads port modes and capabilities for a given port.
     * Stream completes when the response is received from the hub.
     *
     * @param portId
     */
    getPortModes(
        portId: number
    ): Observable<PortModeInboundMessage>;

    /**
     * Reads information about a given mode for a given port (e.g. mode name ('absolutePosition', 'speed', etc.))
     * Stream completes when the response is received from the hub.
     *
     * @param portId
     * @param mode
     * @param modeInformationType
     */
    getPortModeInformation<T extends PortModeInformationType>(
        portId: number,
        mode: number,
        modeInformationType: T
    ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }>;

    /**
     * Creates a virtual port that merges two physical ports.
     * Virtual ports can be used to control two motors in a synchronized way.
     *
     * @param portIdA
     * @param portIdB
     */
    createVirtualPort(
        portIdA: number,
        portIdB: number,
    ): Observable<AttachedIOAttachVirtualInboundMessage>;

    /**
     * Deletes a virtual port.
     *
     * @param virtualPortId
     */
    deleteVirtualPort(
        virtualPortId: number
    ): Observable<AttachedIODetachInboundMessage>;
}
