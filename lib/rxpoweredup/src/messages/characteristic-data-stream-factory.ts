import { EMPTY, Observable, fromEvent, map, of, share, switchMap } from 'rxjs';
import { inject, injectable } from 'tsyringe';

import { InboundMessageDissector } from './inbound-message-dissector';
import { MessageType } from '../constants';
import { CharacteristicDataStreamConfig, ICharacteristicDataStreamFactory } from '../hub';
import { RawMessage } from '../types';

@injectable()
export class CharacteristicDataStreamFactory implements ICharacteristicDataStreamFactory {
    private readonly characteristicValueChangedEventName = 'characteristicvaluechanged';

    constructor(
        @inject(InboundMessageDissector) private readonly dissector: InboundMessageDissector,
    ) {
    }

    public create(
        characteristic: BluetoothRemoteGATTCharacteristic,
        config: CharacteristicDataStreamConfig
    ): Observable<RawMessage<MessageType>> {
        return fromEvent(characteristic, this.characteristicValueChangedEventName).pipe(
            map((e) => this.getValueFromEvent(e)),
            switchMap((value) => value ? of(value) : EMPTY),
            map((uint8Message) => this.dissector.dissect(uint8Message)),
            map((message) => config.incomingMessageMiddleware.reduce((acc, middleware) => middleware.handle(acc), message)),
            share()
        );
    }

    private getValueFromEvent(event: Event): null | Uint8Array {
        const buffer = (event.target as BluetoothRemoteGATTCharacteristic).value?.buffer;
        if (!buffer) {
            return null;
        }
        return new Uint8Array(buffer);
    }
}
