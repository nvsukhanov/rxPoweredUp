import { Observable } from 'rxjs';

export interface IRawPortValueProvider {
    getRawPortValue(
        portId: number,
        modeId: number,
    ): Observable<number[]>;
}
