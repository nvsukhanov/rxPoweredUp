import { createContext } from 'react';
import { DependencyContainer, container } from 'tsyringe';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DiContext = createContext<DependencyContainer>(container);
