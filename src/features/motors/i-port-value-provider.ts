import { Observable } from 'rxjs';

import { PortModeName } from '../../constants';
import { PortValueInboundMessage } from '../../types';

export interface IPortValueProvider {
    getPortValue<T extends PortModeName>(
        portId: number,
        modeId: number,
        portModeName: T
    ): Observable<PortValueInboundMessage & { modeName: T }>
}
