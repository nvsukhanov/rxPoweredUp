import { AttachedIoRepliesCache } from './attached-io-replies-cache';
import { Observable } from 'rxjs';
import { injectable } from 'tsyringe';
import { AttachedIOInboundMessage } from '../../types';

@injectable()
export class AttachedIoRepliesCacheFactory {
    public create(
        messages$: Observable<AttachedIOInboundMessage>,
        onDisconnected$: Observable<void>,
    ): AttachedIoRepliesCache {
        return new AttachedIoRepliesCache(messages$, onDisconnected$);
    }
}
