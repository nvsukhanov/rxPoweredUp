import { Observable } from 'rxjs';

export interface IDisposable {
    dispose(): Observable<void>;
}
