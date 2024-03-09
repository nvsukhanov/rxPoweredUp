import { HubPropertiesReplyParser } from './hub-properties-reply-parser';
import { HubProperty, HubPropertyOperation, MessageType } from '../../constants';

describe('HubPropertiesReplyParser', () => {
    let subject: HubPropertiesReplyParser;

    beforeEach(() => {
        subject = new HubPropertiesReplyParser();
    });

    it('should parse firmware version', () => {
        const payload = new Uint8Array([ HubProperty.firmwareVersion, HubPropertyOperation.requestUpdate, 0x10, 0x15, 0x37, 0x17 ]);
        const result = subject.parseMessage({
            header: {
                messageType: MessageType.properties,
            },
            payload
        });
        expect(result).toEqual({
            messageType: MessageType.properties,
            propertyType: HubProperty.firmwareVersion,
            firmwareVersion: {
                major: 1,
                minor: 7,
                bugfix: 37,
                build: 1510
            }
        });
    });

    it('should parse hardware version', () => {
        const payload = new Uint8Array([ HubProperty.hardwareVersion, HubPropertyOperation.requestUpdate, 0x00, 0x00, 0x00, 0x12 ]);
        const result = subject.parseMessage({
            header: {
                messageType: MessageType.properties,
            },
            payload
        });
        expect(result).toEqual({
            messageType: MessageType.properties,
            propertyType: HubProperty.hardwareVersion,
            hardwareVersion: {
                major: 1,
                minor: 2,
                bugfix: 0,
                build: 0
            }
        });
    });
});
