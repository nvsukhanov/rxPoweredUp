import { devtools } from 'zustand/middleware';
import { StateCreator, create } from 'zustand';

import {
    AttachIoEvent,
    AttachedIOAttachVirtualInboundMessage,
    AttachedIODetachInboundMessage,
    AttachedIoAttachInboundMessage,
    HubType,
    IOType,
    MessageType,
    PortModeInboundMessage,
    PortModeInformationInboundMessage,
    PortModeInformationType,
    RawMessage,
    TiltData
} from 'rxpoweredup';
import { BluetoothAvailability, HubConnectionState } from '../types';

const MAX_MESSAGE_LOG_SIZE = 100;

export function hashPortIdModeId(portId: number, modeId: number): string {
    return `${portId}-${modeId}`;
}

export type PhysicalPortState = {
    isPhysical: true;
    portId: number;
    hardwareRevision: string;
    softwareRevision: string;
    ioType: IOType;
};

export type VirtualPortState = {
    isPhysical: false;
    portId: number;
    ioType: IOType;
    portIdA: number;
    portIdB: number;
};

export type PortModeState = {
    portId: number;
    inputModes: number[];
    outputModes: number[];
    capabilities: {
        output: boolean;
        input: boolean;
        logicalCombinable: boolean;
        logicalSynchronizable: boolean;
    };
};

export type PortModeInfoState = {
    portId: number;
    modeId: number;
    rawValue?: number[];
    modeInfo: {
        [k in PortModeInformationType]?: object
    };
};

export type HubPropertiesState = {
    batteryLevel?: number;
    rssiLevel?: number;
    buttonState?: boolean;
    advertisingName?: string;
    systemTypeId?: HubType;
    manufacturerName?: string;
    primaryMacAddress?: string;
};

export enum MessageDirection {
    Inbound,
    Outbound
}

export type MessageLogEntry = {
    id: string;
    messageType: MessageType;
    direction: MessageDirection;
    payload: number[];
    timestamp: number;
};

export type PortValuesState = {
    rawValue?: number[];
    parsedValue?: string;
};

export type HubStore = {
    isBluetoothAvailable: BluetoothAvailability;
    messagesLog: MessageLogEntry[];
    hubConnection: HubConnectionState;
    hubProperties: HubPropertiesState;
    ports: {
        [portId in number]: PhysicalPortState | VirtualPortState;
    };
    portModes: {
        [portId in number]: PortModeState;
    };
    portModeInfo: {
        [hash in string]: PortModeInfoState;
    };
    portValues: {
        [hash in string]: PortValuesState;
    };
    sensorsData: {
        voltage?: number;
        temperature?: number;
        tilt?: TiltData;
    };
    setBluetoothAvailability: (bluetoothAvailable: boolean) => void;
    setHubConnection: (hubConnectionState: HubConnectionState) => void;
    setHubProperty<K extends keyof HubPropertiesState>(key: K, value: HubPropertiesState[K]): void;
    processIoAttachMessage(message: AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage): void;
    processIoDetachMessage(message: AttachedIODetachInboundMessage): void;
    processPortModeMessage(message: PortModeInboundMessage): void;
    processPortModeInformationMessage(message: PortModeInformationInboundMessage): void;
    processPortModeInformationRequestError(portId: number, modeId: number, infoType: PortModeInformationType, error: Error): void;
    processPortRawValue(portId: number, modeId: number, rawValue: number[]): void;
    processPortValue(portId: number, modeId: number, parsedValue: string): void;
    addMessagesLogEntry(direction: MessageDirection, message: RawMessage<MessageType>, id: string): void;
    updateSensorVoltage(voltage?: number): void;
    updateSensorTemperature(temperature?: number): void;
    updateSensorTilt(tilt?: TiltData): void;
    onHubDisconnect(): void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const useHubStore = create<HubStore>(devtools((set) => ({
    isBluetoothAvailable: BluetoothAvailability.Unknown,
    messagesLog: [],
    hubConnection: HubConnectionState.Disconnected,
    hubProperties: {},
    ports: {},
    portModes: {},
    portModeInfo: {},
    portValues: {},
    setHubProperty<K extends keyof HubPropertiesState>(key: K, value: HubPropertiesState[K]): void {
        set((state) => {
            return {
                ...state,
                hubProperties: {
                    ...state.hubProperties,
                    [key]: value
                }
            };
        });
    },
    sensorsData: {},
    processIoAttachMessage(
        message: AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage
    ): void {
        switch (message.event) {
            case AttachIoEvent.Attached:
                set((state) => {
                    return {
                        ...state,
                        ports: {
                            ...state.ports,
                            [message.portId]: {
                                isPhysical: true,
                                portId: message.portId,
                                hardwareRevision: message.hardwareRevision,
                                softwareRevision: message.softwareRevision,
                                ioType: message.ioTypeId
                            }
                        }
                    };
                });
                break;
            case AttachIoEvent.AttachedVirtual:
                set((state) => {
                    return {
                        ...state,
                        ports: {
                            ...state.ports,
                            [message.portId]: {
                                isPhysical: false,
                                portId: message.portId,
                                ioType: message.ioTypeId,
                                portIdA: message.portIdA,
                                portIdB: message.portIdB
                            }
                        }
                    };
                });
                break;
        }
    },
    processIoDetachMessage(message: AttachedIODetachInboundMessage): void {
        set((state) => {
            const ports = { ...state.ports };
            delete ports[message.portId];
            return {
                ...state,
                ports
            };
        });
    },
    processPortModeMessage(message: PortModeInboundMessage): void {
        set((state) => {
            return {
                ...state,
                portModes: {
                    ...state.portModes,
                    [message.portId]: {
                        portId: message.portId,
                        inputModes: message.inputModes,
                        outputModes: message.outputModes,
                        capabilities: { ...message.capabilities }
                    }
                }
            };
        });
    },
    processPortRawValue(portId: number, modeId: number, rawValue: number[]): void {
        const hash = hashPortIdModeId(portId, modeId);
        set((state) => {
            return {
                ...state,
                portValues: {
                    ...state.portValues,
                    [hash]: {
                        ...(state.portValues[hash] ?? {}),
                        rawValue,
                    }
                }
            };
        });
    },
    processPortValue(portId: number, modeId: number, parsedValue: string): void {
        const hash = hashPortIdModeId(portId, modeId);
        set((state) => {
            return {
                ...state,
                portValues: {
                    ...state.portValues,
                    [hash]: {
                        ...(state.portValues[hash] ?? {}),
                        parsedValue,
                    }
                }
            };
        });
    },
    processPortModeInformationMessage(message: PortModeInformationInboundMessage): void {
        const hash = hashPortIdModeId(message.portId, message.mode);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { portId, mode, modeInformationType, messageType, ...data } = message;

        set((state) => {
            return {
                ...state,
                portModeInfo: {
                    ...state.portModeInfo,
                    [hash]: {
                        ...(state.portModeInfo[hash] || { rawValue: undefined }),
                        portId: message.portId,
                        modeId: message.mode,
                        modeInfo: {
                            ...state.portModeInfo[hash]?.modeInfo,
                            [message.modeInformationType]: data
                        }
                    }
                }
            };
        });
    },
    processPortModeInformationRequestError(portId: number, modeId: number, infoType: PortModeInformationType, error: Error): void {
        const hash = hashPortIdModeId(portId, modeId);
        set((state) => {
            return {
                ...state,
                portModeInfo: {
                    ...state.portModeInfo,
                    [hash]: {
                        ...(state.portModeInfo[hash] || { rawValue: undefined }),
                        portId,
                        modeId,
                        modeInfo: {
                            ...state.portModeInfo[hash]?.modeInfo,
                            [infoType]: { status: 'Error', error: error.toString() }
                        }
                    }
                }
            };
        });
    },
    setHubConnection: (hubConnectionState: HubConnectionState): void => {
        return set((state) => {
            return {
                ...state,
                hubConnection: hubConnectionState
            };
        });
    },
    setBluetoothAvailability: (isAvailable: boolean): void => {
        return set((state) => {
            return {
                ...state,
                isBluetoothAvailable: isAvailable ? BluetoothAvailability.Available : BluetoothAvailability.Unavailable
            };
        });
    },
    addMessagesLogEntry(
        direction: MessageDirection,
        message: RawMessage<MessageType>,
        id: string
    ): void {
        set((state) => {
            const messagesLog = [ ...state.messagesLog ];
            if (messagesLog.length > MAX_MESSAGE_LOG_SIZE) {
                messagesLog.splice(0, messagesLog.length - MAX_MESSAGE_LOG_SIZE);
            }
            messagesLog.push({
                messageType: message.header.messageType,
                direction,
                payload: [ ...message.payload ],
                timestamp: Date.now(),
                id
            });
            return {
                ...state,
                messagesLog
            };
        });
    },
    updateSensorVoltage(voltage?: number): void {
        set((state) => {
            return {
                ...state,
                sensorsData: {
                    ...state.sensorsData,
                    voltage
                }
            };
        });
    },
    updateSensorTemperature(temperature?: number): void {
        set((state) => {
            return {
                ...state,
                sensorsData: {
                    ...state.sensorsData,
                    temperature
                }
            };
        });
    },
    updateSensorTilt(tilt?: TiltData): void {
        set((state) => {
            return {
                ...state,
                sensorsData: {
                    ...state.sensorsData,
                    tilt
                }
            };
        });
    },
    onHubDisconnect: (): void => {
        return set((state) => {
            return {
                ...state,
                hubConnection: HubConnectionState.Disconnected,
                ports: {},
                portModes: {},
                portModeInfo: {},
                messagesLog: []
            };
        });
    }
})) as StateCreator<HubStore>);
