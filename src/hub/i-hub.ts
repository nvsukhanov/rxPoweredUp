import { Observable } from 'rxjs';

import { IHubPropertiesFeature } from './i-hub-properties-feature';
import { IPortOutputCommandsFeature } from './i-port-output-commands-feature';
import { IPortsFeature } from './i-ports-feature';
import { GenericErrorCode, MessageType } from '../constants';

export type GenericError = {
    commandType: MessageType;
    code: GenericErrorCode;
}

export interface IHub {
    /**
     * Emits when a generic error is received from the hub.
     * Generic errors are errors that are not specific to a feature.
     * e.g when a port output command for a port without an attached it is sent to the hub, the stream will emit:
     * { commandType: MessageType.portOutputCommandFeedback, code: GenericErrorCode.invalidUse }
     */
    readonly genericErrors: Observable<GenericError>;
    /**
     * Provides a way to access the ports information of the hub.
     * e.g. listen to port attach/detach events, request port value, etc.
     * Hub identifies ports by their numerical index (not by their literal name engraved on the hub).
     * e.g. port A is index 0, port B is index 1, etc.
     * Also note that hubs usually have internal ports that can be accessed by their index as well (eg. 50).
     * On hub connection, the hub will emit a port attach event for each port that has a device attached to it, including internal ports.
     */
    readonly ports: IPortsFeature;

    /**
     * Provides a way to send commands to devices attached to ports.
     * e.g. start motor, etc
     */
    readonly commands: IPortOutputCommandsFeature;

    /**
     * Provides a way to access the properties of the hub.
     * e.g. listen to battery level changes, set hub advertising name, etc.
     */
    readonly properties: IHubPropertiesFeature;

    /**
     * Emits when the hub disconnect method is called but before the hub is actually disconnected.
     * Can be used to perform some cleanup before the hub is disconnected.
     */
    readonly beforeDisconnect: Observable<void>;

    /**
     * Emits when the hub is disconnected.
     * Can be used to perform actions after the hub is disconnected.
     */
    readonly disconnected: Observable<void>;

    /**
     * Connects to the hub.
     * Must be called before using any hub features.
     */
    connect(): Observable<void>

    /**
     * Disconnects from the hub.
     */
    disconnect(): Observable<void>
}
