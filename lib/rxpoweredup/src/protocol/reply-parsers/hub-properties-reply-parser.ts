import { injectable } from 'tsyringe';

import { HUB_DEVICE_TYPE_MAP, HubProperty, HubType, MessageType } from '../../constants';
import { IReplyParser } from '../../hub';
import {
  HubPropertyAdvertisingNameInboundMessage,
  HubPropertyBatteryInboundMessage,
  HubPropertyButtonStateInboundMessage,
  HubPropertyFirmwareVersionInboundMessage,
  HubPropertyHardwareVersionInboundMessage,
  HubPropertyInboundMessage,
  HubPropertyManufacturerNameInboundMessage,
  HubPropertyPrimaryMacAddressInboundMessage,
  HubPropertyRssiInboundMessage,
  HubPropertySystemTypeIdInboundMessage,
  InboundMessage,
  RawMessage,
  VersionInformation,
} from '../../types';
import { convertUint8ToSignedInt } from '../../helpers';

@injectable()
export class HubPropertiesReplyParser implements IReplyParser<MessageType.properties> {
  public readonly messageType = MessageType.properties;

  private readonly hubPropertyLength = 1;

  private readonly operationLength = 1;

  private readonly hubPropertyValueParser = {
    [HubProperty.batteryVoltage]: (v): HubPropertyBatteryInboundMessage => this.parseBatteryData(v),
    [HubProperty.RSSI]: (v): HubPropertyRssiInboundMessage => this.parseRssiLevel(v),
    [HubProperty.systemTypeId]: (v): HubPropertySystemTypeIdInboundMessage => this.parseSystemTypeId(v),
    [HubProperty.button]: (v): HubPropertyButtonStateInboundMessage => this.parseButtonState(v),
    [HubProperty.primaryMacAddress]: (v): HubPropertyPrimaryMacAddressInboundMessage => this.parsePrimaryMacAddress(v),
    [HubProperty.advertisingName]: (v): HubPropertyAdvertisingNameInboundMessage => this.parseAdvertisingName(v),
    [HubProperty.manufacturerName]: (v): HubPropertyManufacturerNameInboundMessage => this.parseManufacturerName(v),
    [HubProperty.firmwareVersion]: (v): HubPropertyFirmwareVersionInboundMessage => this.parseFirmwareVersion(v),
    [HubProperty.hardwareVersion]: (v): HubPropertyHardwareVersionInboundMessage => this.parseHardwareVersion(v),
  } satisfies { [k in HubProperty]: (payload: Uint8Array) => HubPropertyInboundMessage };

  public parseMessage(message: RawMessage<MessageType.properties>): InboundMessage & { messageType: MessageType.properties } {
    const propertyType = message.payload[0] as HubProperty;
    const payload = message.payload.slice(this.hubPropertyLength + this.operationLength);
    return this.hubPropertyValueParser[propertyType](payload);
  }

  private parseBatteryData(payload: Uint8Array): HubPropertyBatteryInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.batteryVoltage,
      level: payload[0],
    };
  }

  private parseRssiLevel(payload: Uint8Array): HubPropertyRssiInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.RSSI,
      // rssi is an int8 stored as uint8, so we have to convert it,
      // ref: https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#hub-property-payload
      level: convertUint8ToSignedInt(payload[0]),
    };
  }

  private parseSystemTypeId(payload: Uint8Array): HubPropertySystemTypeIdInboundMessage {
    const systemTypeId = payload[0];
    if (!(systemTypeId in HUB_DEVICE_TYPE_MAP)) {
      return {
        messageType: MessageType.properties,
        propertyType: HubProperty.systemTypeId,
        hubType: HubType.Unknown,
      };
    }
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.systemTypeId,
      hubType: HUB_DEVICE_TYPE_MAP[payload[0] as keyof typeof HUB_DEVICE_TYPE_MAP],
    };
  }

  private parseManufacturerName(payload: Uint8Array): HubPropertyManufacturerNameInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.manufacturerName,
      manufacturerName: [...payload].map((v) => String.fromCharCode(v)).join(''),
    };
  }

  private parseButtonState(payload: Uint8Array): HubPropertyButtonStateInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.button,
      isPressed: payload[0] === 1,
    };
  }

  private parsePrimaryMacAddress(payload: Uint8Array): HubPropertyPrimaryMacAddressInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.primaryMacAddress,
      macAddress: [...payload].map((v: number) => v.toString(16).padStart(2, '0')).join(':'),
    };
  }

  private parseAdvertisingName(payload: Uint8Array): HubPropertyAdvertisingNameInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.advertisingName,
      advertisingName: [...payload].map((v) => String.fromCharCode(v)).join(''),
    };
  }

  private parseFirmwareVersion(payload: Uint8Array): HubPropertyFirmwareVersionInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.firmwareVersion,
      firmwareVersion: this.decodeVersion(payload),
    };
  }

  private parseHardwareVersion(payload: Uint8Array): HubPropertyHardwareVersionInboundMessage {
    return {
      messageType: MessageType.properties,
      propertyType: HubProperty.hardwareVersion,
      hardwareVersion: this.decodeVersion(payload),
    };
  }

  /**
   * Decodes the version information from the payload. See https://lego.github.io/lego-ble-wireless-protocol-docs/index.html#ver-no
   * @param payload
   * @private
   */
  private decodeVersion(payload: Uint8Array): VersionInformation {
    const major = (payload[3] & 0b01110000) >>> 4;
    const minor = payload[3] & 0b00001111;
    const bugfix = payload[2];
    const build = payload[0] + (payload[1] << 8);
    return {
      major: major.toString(16),
      minor: minor.toString(16),
      bugfix: bugfix.toString(16),
      build: build.toString(16),
    };
  }
}
