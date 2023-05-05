import { AttachedIoRepliesCache } from './attached-io-replies-cache';
import { Observable } from 'rxjs';
import { AttachedIOInboundMessage } from '../messages';
import { injectable } from 'tsyringe';

@injectable()
export class AttachedIoRepliesCacheFactory {
    public create(
        messages$: Observable<AttachedIOInboundMessage>,
        onDisconnected$: Observable<void>,
    ): AttachedIoRepliesCache {
        return new AttachedIoRepliesCache(messages$, onDisconnected$);
    }
}
