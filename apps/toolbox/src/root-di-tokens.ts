import { container } from 'tsyringe';

import { ERROR_HANDLER, NAVIGATOR, WINDOW } from './types';
import { ErrorHandler } from './common';

export function provideRootDiTokens(): void {
    container.register(WINDOW, { useValue: window });
    container.register(NAVIGATOR, { useFactory: (c) => c.resolve(WINDOW).navigator });
    container.register(ERROR_HANDLER, ErrorHandler);
}
