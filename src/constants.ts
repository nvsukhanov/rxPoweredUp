export const HUB_SERVICE_UUID = '00001623-1212-efde-1623-785feabcd123';
export const HUB_CHARACTERISTIC_UUID = '00001624-1212-efde-1623-785feabcd123';

export enum MessageType {
    properties = 0x01,
    action = 0x02,
    attachedIO = 0x04,
    genericError = 0x05,
    portInformationRequest = 0x21, // 33
    portModeInformationRequest = 0x22, // 34
    portInputFormatSetupSingle = 0x41, // 65
    portInformation = 0x43, // 67
    portModeInformation = 0x44, // 68
    portValueSingle = 0x45, // 69
    portInputFormatSetupSingleHandshake = 0x47, // 71
    virtualPortSetup = 0x61, // 97
    portOutputCommand = 0x81, // 129
    portOutputCommandFeedback = 0x82, // 130
}

export enum HubActionType {
    switchOff = 0x01,
    disconnect = 0x02,
    willSwitchOff = 0x30, // 48
    willDisconnect = 0x31, // 49
}

export type OutboundMessageTypes = MessageType.properties
    | MessageType.portInformationRequest
    | MessageType.portModeInformationRequest
    | MessageType.portInputFormatSetupSingle
    | MessageType.action
    | MessageType.virtualPortSetup;

export enum PortModeInformationType {
    name = 0x00,
    rawRange = 0x01,
    pctRange = 0x02,
    siRange = 0x03,
    symbol = 0x04,
    mapping = 0x05,
    motorBias = 0x07,
    capabilityBits = 0x08,
    valueFormat = 0x09,
}

export enum PortInformationRequestType {
    portValue = 0x00,
    modeInfo = 0x01,
}

export enum PortInformationReplyType {
    modeInfo = 0x01,
}

export enum AttachIoEvent {
    Detached = 0x00,
    Attached = 0x01,
    AttachedVirtual = 0x02
}

export enum IOType {
    motor = 0x0001, // 1
    systemTrainMotor = 0x0002, // 2
    button = 0x0005, // 5
    ledLight = 0x0008, // 8
    voltage = 0x0014, // 20
    current = 0x0015, // 21
    piezoTone = 0x0016, // 22
    rgbLight = 0x0017, // 23
    externalTiltSensor = 0x0022, // 34
    motionSensor = 0x0023, // 35
    visionSensor = 0x0025, // 37
    externalMotorWithTacho = 0x0026, // 38
    internalMotorWithTacho = 0x0027, // 39
    internalTilt = 0x0028, // 40
    largeTechnicMotor = 0x002E, // 46
    xLargeTechnicMotor = 0x002F, // 47
    gestureSensor = 0x0036, // 54
    handsetButtonGroup = 0x0037, // 55
    accelerometerSensor = 0x0039, // 57
    gyroscopeSensor = 0x003A, // 58
    tiltSensor = 0x003B, // 59
    temperatureSensor = 0x003C, // 60
    mediumTechnicAngularMotor = 0x004B, // 75
    largeTechnicAngularMotor = 0x004C, // 76
}

export enum HubPropertyOperation {
    setProperty = 0x01,
    enableUpdates = 0x02,
    disableUpdates = 0x03,
    reset = 0x04,
    requestUpdate = 0x05,
    update = 0x06
}

export const MAX_NAME_SIZE = 14;

export enum HubProperty {
    advertisingName = 0x01,
    button = 0x02,
    RSSI = 0x05,
    batteryVoltage = 0x06,
    systemTypeId = 0x0B, // 11
    primaryMacAddress = 0x0D, // 13
}

export enum HubType {
    WeDoHub,
    DuploTrain,
    BoostHub,
    TwoPortHub,
    TwoPortHandset,
    Unknown
}

export const HUB_DEVICE_TYPE_MAP = {
    [0b00000000]: HubType.WeDoHub,
    [0b00100000]: HubType.DuploTrain,
    [0b01000000]: HubType.BoostHub,
    [0b01000001]: HubType.TwoPortHub,
    [0b01000010]: HubType.TwoPortHandset,
} satisfies { [k in number]: HubType };

export enum PortModeName {
    speed = 'SPEED',
    position = 'POS',
    absolutePosition = 'APOS',
    power = 'POWER',
    color = 'COL O',
    rgb = 'RGB O',
    currentS = 'CUR S',
    currentL = 'CUR L',
    voltageS = 'VLT S',
    voltageL = 'VLT L',
    handsetRCKey = 'RCKEY',
    handsetKeyA = 'KEYA',
    handsetKeyR = 'KEYR',
    handsetKeyD = 'KEYD',
    handsetKeySD = 'KEYSD',
    raw = 'RAW',
}

export enum PortModeSymbol {
    percent = 'PCT',
    degree = 'DEG',
    milliAmps = 'mA',
    milliVolts = 'mV',
    button = 'btn',
    generic = ''
}

export const MOTOR_LIMITS = {
    maxSpeed: 100,
    minSpeed: -100,
    minPower: 0,
    maxPower: 100,
    minRawAngle: -0x7FFFFFF, // -2147483647
    maxRawAngle: 0x7FFFFFF, // 2147483647
    minServoDegreesRange: 15,
    maxServoDegreesRange: 360,
    maxAccDecTime: 10000,
    minAccDecTime: 0
} as const;

export enum MotorServoEndState {
    float = 0x00,
    hold = 0x7e, // 126
    brake = 0x7f, // 127
}

export enum PortOperationStartupInformation {
    bufferIfNecessary = 0b00000000,
    executeImmediately = 0b00010000
}

export enum PortOperationCompletionInformation {
    noAction = 0b00000000,
    commandFeedback = 0b00000001,
}

export enum MotorUseProfile {
    dontUseProfiles = 0b00000000,
    useAccelerationProfile = 0b00000001,
    useDecelerationProfile = 0b00000010,
    useAccelerationAndDecelerationProfiles = 0b00000011,
}

export enum OutputSubCommand {
    setAccTime = 0x05,
    setDecTime = 0x06,
    startSpeed = 0x07,
    startSpeedSynchronized = 0x08,
    startSpeedForDegrees = 0x0B,
    gotoAbsolutePosition = 0x0D, // 13
    gotoAbsolutePositionSynchronized = 0x0E, // 14
    writeDirectModeData = 0x51, // 81
}

export enum WriteDirectModeDataSubCommand {
    presetEncoder = 0x02,
}

export enum PortCommandFeedbackMask {
    bufferEmptyCommandInProgress = 0x01, // 0b000001 // 1
    bufferEmptyCommandCompleted = 0x02,  // 0b000010 // 2
    currentCommandDiscarded = 0x04,      // 0b000100 // 4
    idle = 0x08,                         // 0b001000 // 8
    busyOrFull = 0x10,                   // 0b010000 // 16
    executionError = 0x20,               // 0b100000 // 32 // missing in docs but present in responses (i.g. servo unable to reach position)
}

export enum GenericErrorCode {
    ACK = 0x01,
    MACK = 0x02,
    bufferOverflow = 0x03,
    timeout = 0x04,
    commandNotRecognized = 0x05,
    invalidUse = 0x06,
    overcurrent = 0x07,
    internalError = 0x08,
}

export enum ButtonGroupButtonId {
    None = 0,
    Plus = 1,
    Red = 127,
    Minus = 255,
}

export const MOTOR_ACC_DEC_DEFAULT_PROFILE_ID = 0;

export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
}

export const WELL_KNOWN_MOTOR_PORT_MODE_IDS = {
    [PortModeName.power]: 0,
    [PortModeName.speed]: 1,
    [PortModeName.position]: 2,
    [PortModeName.absolutePosition]: 3,
} as const satisfies { [s in PortModeName]?: number };

export enum VirtualPortSetupCommand {
    Disconnect = 0x00,
    Connect = 0x01
}

export type SubscribableHubProperties = HubProperty.RSSI | HubProperty.batteryVoltage | HubProperty.button | HubProperty.advertisingName;

export type WritableHubProperties = HubProperty.advertisingName;
