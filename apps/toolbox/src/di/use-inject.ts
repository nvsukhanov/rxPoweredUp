import { InjectionToken } from 'tsyringe';
import { useContext } from 'react';

import { DiContext } from './di-context.ts';

export function useInject<T>(
    token: InjectionToken<T>
): T {
    return useContext(DiContext).resolve(token);
}
