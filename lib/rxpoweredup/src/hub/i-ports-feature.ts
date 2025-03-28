import { Observable } from 'rxjs';

import {
  AttachedIOAttachVirtualInboundMessage,
  AttachedIODetachInboundMessage,
  AttachedIoAttachInboundMessage,
  IPortValueTransformer,
  PortModeInboundMessage,
  PortModeInformationInboundMessage,
} from '../types';
import { AttachIoEvent, IOType, PortModeInformationType } from '../constants';

export type OnIoAttachFilter = {
  ports?: ReadonlyArray<number>;
  ioTypes?: ReadonlyArray<IOType>;
  eventTypes?: ReadonlyArray<AttachIoEvent.Attached | AttachIoEvent.AttachedVirtual>;
};

export type OnIoDetachFilter = {
  ports?: ReadonlyArray<number>;
};

export interface IPortsFeature {
  /**
   * Emits when an io device is attached to a port.
   * If portId is not specified, it will emit for all ports.
   * Events are cached, so if you subscribe after an io device is attached, you will still get the event.
   * @param filterOptions - Optional filter options. If not specified, all events will be emitted. Port id may be specified to filter by port.
   */
  onIoAttach(filterOptions?: OnIoAttachFilter): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;

  onIoAttach(filterOptions?: number): Observable<AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage>;

  /**
   * Emits when an io device is detached from a port.
   * If portId is not specified, it will emit for all ports.
   * @param filterOptions - Optional filter options. If not specified, all events will be emitted. Port id may be specified to filter by port.
   */
  onIoDetach(filterOptions?: OnIoDetachFilter): Observable<AttachedIODetachInboundMessage>;

  onIoDetach(filterOptions?: number): Observable<AttachedIODetachInboundMessage>;

  /**
   * Reads port modes and capabilities for a given port.
   * Stream completes when the response is received from the hub.
   *
   * @param portId
   */
  getPortModes(portId: number): Observable<PortModeInboundMessage>;

  /**
   * Reads information about a given mode for a given port (e.g. mode name ('absolutePosition', 'speed', etc.))
   * Stream completes when the response is received from the hub.
   *
   * @param portId
   * @param modeId
   * @param modeInformationType
   */
  getPortModeInformation<T extends PortModeInformationType>(
    portId: number,
    modeId: number,
    modeInformationType: T
  ): Observable<PortModeInformationInboundMessage & { modeInformationType: T }>;

  /**
   * Reads raw port value for a given port and mode id.
   * Stream completes when the response is received from the hub.
   *
   * @param portId - The port id to read the value for.
   * @param modeId - The mode id to read the value for.
   * @param transformer - Optional transformer to convert the raw value into a value that can be used by the application (or read by humans).
   */
  getPortValue<TTransformer extends IPortValueTransformer<unknown> | void = void>(
    portId: number,
    modeId: number,
    transformer?: TTransformer
  ): TTransformer extends IPortValueTransformer<infer R> ? Observable<R> : Observable<number[]>;

  /**
   * Provides port value updates for a given port and mode id.
   *
   * @param portId - The port id to read the value for.
   * @param modeId - The mode id to read the value for.
   * @param deltaThreshold If the difference between the current value and the previous value is less than this threshold, the value will not be emitted.
   * @param transformer - Optional transformer to convert the raw value into a value that can be used by the application (or read by humans).
   */
  portValueChanges<TTransformer extends IPortValueTransformer<unknown> | void = void>(
    portId: number,
    modeId: number,
    deltaThreshold: TTransformer extends IPortValueTransformer<infer R> ? R : number,
    transformer?: TTransformer
  ): TTransformer extends IPortValueTransformer<infer R> ? Observable<R> : Observable<number[]>;

  /**
   * Creates a virtual port that merges two physical ports.
   * Virtual ports can be used to control two motors in a synchronized way.
   *
   * @param portIdA
   * @param portIdB
   */
  createVirtualPort(portIdA: number, portIdB: number): Observable<AttachedIOAttachVirtualInboundMessage>;

  /**
   * Deletes a virtual port.
   *
   * @param virtualPortId
   */
  deleteVirtualPort(virtualPortId: number): Observable<AttachedIODetachInboundMessage>;
}
