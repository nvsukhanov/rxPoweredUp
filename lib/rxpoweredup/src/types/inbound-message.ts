import {
  AttachIoEvent,
  GenericErrorCode,
  HubActionType,
  HubProperty,
  HubType,
  IOType,
  MessageType,
  PortInformationReplyType,
  PortModeInformationType,
} from '../constants';

export type HubPropertyBaseInboundMessage = {
  messageType: MessageType.properties;
};

export type VersionInformation = {
  major: string;
  minor: string;
  bugfix: string;
  build: string;
};

export type HubPropertyBatteryInboundMessage = {
  propertyType: HubProperty.batteryVoltage;
  level: number;
} & HubPropertyBaseInboundMessage;

export type HubPropertyRssiInboundMessage = {
  propertyType: HubProperty.RSSI;
  level: number;
} & HubPropertyBaseInboundMessage;

export type HubPropertySystemTypeIdInboundMessage = {
  propertyType: HubProperty.systemTypeId;
  hubType: HubType;
} & HubPropertyBaseInboundMessage;

export type HubPropertyManufacturerNameInboundMessage = {
  propertyType: HubProperty.manufacturerName;
  manufacturerName: string;
} & HubPropertyBaseInboundMessage;

export type HubPropertyButtonStateInboundMessage = {
  propertyType: HubProperty.button;
  isPressed: boolean;
} & HubPropertyBaseInboundMessage;

export type HubPropertyPrimaryMacAddressInboundMessage = {
  propertyType: HubProperty.primaryMacAddress;
  macAddress: string;
} & HubPropertyBaseInboundMessage;

export type HubPropertyAdvertisingNameInboundMessage = {
  propertyType: HubProperty.advertisingName;
  advertisingName: string;
} & HubPropertyBaseInboundMessage;

export type HubPropertyFirmwareVersionInboundMessage = {
  propertyType: HubProperty.firmwareVersion;
  firmwareVersion: VersionInformation;
} & HubPropertyBaseInboundMessage;

export type HubPropertyHardwareVersionInboundMessage = {
  propertyType: HubProperty.hardwareVersion;
  hardwareVersion: VersionInformation;
} & HubPropertyBaseInboundMessage;

export type HubPropertyInboundMessage =
  | HubPropertyBatteryInboundMessage
  | HubPropertyRssiInboundMessage
  | HubPropertySystemTypeIdInboundMessage
  | HubPropertyButtonStateInboundMessage
  | HubPropertyPrimaryMacAddressInboundMessage
  | HubPropertyAdvertisingNameInboundMessage
  | HubPropertyManufacturerNameInboundMessage
  | HubPropertyFirmwareVersionInboundMessage
  | HubPropertyHardwareVersionInboundMessage;

export type AttachedIoAttachInboundMessage = {
  messageType: MessageType.attachedIO;
  portId: number;
  event: AttachIoEvent.Attached;
  ioTypeId: IOType;
  hardwareRevision: string;
  softwareRevision: string;
};

export type AttachedIOAttachVirtualInboundMessage = {
  messageType: MessageType.attachedIO;
  portId: number;
  event: AttachIoEvent.AttachedVirtual;
  ioTypeId: IOType;
  portIdA: number;
  portIdB: number;
};

export type AttachedIODetachInboundMessage = {
  messageType: MessageType.attachedIO;
  portId: number;
  event: AttachIoEvent.Detached;
};

export type AttachedIOInboundMessage = AttachedIoAttachInboundMessage | AttachedIOAttachVirtualInboundMessage | AttachedIODetachInboundMessage;

export type PortValueInboundMessage = {
  messageType: MessageType.portValueSingle;
  portId: number;
  value: number[];
};

export type PortModeInboundMessage = {
  messageType: MessageType.portInformation;
  portId: number;
  informationType: PortInformationReplyType.modeInfo;
  capabilities: {
    output: boolean;
    input: boolean;
    logicalCombinable: boolean;
    logicalSynchronizable: boolean;
  };
  currentModeId: number;
  totalModeCount: number;
  inputModes: number[];
  outputModes: number[];
};

export type PortModeInformationBase = {
  messageType: MessageType.portModeInformation;
  portId: number;
  mode: number;
};

export type PortModeInformationName = {
  modeInformationType: PortModeInformationType.name;
  name: string;
} & PortModeInformationBase;

export type PortModeInformationRawRange = {
  modeInformationType: PortModeInformationType.rawRange;
  rawMin: number;
  rawMax: number;
} & PortModeInformationBase;

export type PortModeInformationPctRange = {
  modeInformationType: PortModeInformationType.pctRange;
  pctMin: number;
  pctMax: number;
} & PortModeInformationBase;

export type PortModeInformationSiRange = {
  modeInformationType: PortModeInformationType.siRange;
  siMin: number;
  siMax: number;
} & PortModeInformationBase;

export type PortModeInformationSymbol = {
  modeInformationType: PortModeInformationType.symbol;
  symbol: string;
} & PortModeInformationBase;

export type PortModeInformationMapping = {
  modeInformationType: PortModeInformationType.mapping;
  inputSide: {
    supportsNull: boolean;
    supportsFunctionalMapping: boolean;
    abs: boolean;
    rel: boolean;
    dis: boolean;
  };
  outputSide: {
    supportsNull: boolean;
    supportsFunctionalMapping: boolean;
    abs: boolean;
    rel: boolean;
    dis: boolean;
  };
} & PortModeInformationBase;

export type PortModeInformationMotorBias = {
  modeInformationType: PortModeInformationType.motorBias;
  motorBias: number;
} & PortModeInformationBase;

export type PortModeInformationCapabilityBits = {
  modeInformationType: PortModeInformationType.capabilityBits;
  capabilityBitsBE: [number, number, number, number, number, number];
} & PortModeInformationBase;

export type PortModeInformationValueFormat = {
  modeInformationType: PortModeInformationType.valueFormat;
  valueFormat: [number, number, number, number];
} & PortModeInformationBase;

export type PortModeInformationInboundMessage =
  | PortModeInformationName
  | PortModeInformationRawRange
  | PortModeInformationPctRange
  | PortModeInformationSiRange
  | PortModeInformationSymbol
  | PortModeInformationMapping
  | PortModeInformationMotorBias
  | PortModeInformationCapabilityBits
  | PortModeInformationValueFormat;

export type PortOutputCommandFeedback = {
  bufferEmptyCommandInProgress: boolean;
  bufferEmptyCommandCompleted: boolean;
  currentCommandDiscarded: boolean;
  idle: boolean;
  busyOrFull: boolean;
  executionError: boolean;
};

export type PortOutputCommandFeedbackInboundMessage = {
  messageType: MessageType.portOutputCommandFeedback;
  portId: number;
  feedback: PortOutputCommandFeedback;
};

export type GenericErrorInboundMessage = {
  messageType: MessageType.genericError;
  commandType: MessageType;
  code: GenericErrorCode;
};

export type PortInputSetupSingleHandshakeInboundMessage = {
  messageType: MessageType.portInputFormatSetupSingleHandshake;
  portId: number;
  modeId: number;
  deltaInterval: number;
  notificationEnabled: boolean;
};

export type HubActionInboundMessage = {
  messageType: MessageType.action;
  actionType: HubActionType;
};

export type InboundMessage =
  | HubPropertyInboundMessage
  | AttachedIOInboundMessage
  | PortModeInboundMessage
  | PortValueInboundMessage
  | PortModeInformationInboundMessage
  | PortOutputCommandFeedbackInboundMessage
  | GenericErrorInboundMessage
  | PortInputSetupSingleHandshakeInboundMessage
  | HubActionInboundMessage;
