import { IMessageMiddleware, MessageType, RawMessage } from 'rxpoweredup';

import { MessageDirection } from '../Store';

export class StoreMessageMiddleware implements IMessageMiddleware {
    constructor(
        private logMessageFn: (direction: MessageDirection, message: RawMessage<MessageType>, id: string) => void,
        private readonly direction: MessageDirection,
        private readonly window: Window
    ) {
    }

    public handle<T extends RawMessage<MessageType>>(
        message: T
    ): T {
        this.logMessageFn(this.direction, message, this.window.crypto.randomUUID());
        return message;
    }
}
