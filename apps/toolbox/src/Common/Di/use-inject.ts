import { InjectionToken } from 'tsyringe';
import { useContext } from 'react';

import { DiContext } from './DiContext';

export function useInject<T>(token: InjectionToken<T>): T {
  return useContext(DiContext).resolve(token);
}
