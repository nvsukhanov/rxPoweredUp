import { container } from 'tsyringe';

import { ERROR_HANDLER, ErrorHandler, NAVIGATOR, WINDOW } from './Common';

export function provideRootDiTokens(): void {
    container.register(WINDOW, { useValue: window });
    container.register(NAVIGATOR, { useFactory: (c) => c.resolve(WINDOW).navigator });
    container.register(ERROR_HANDLER, ErrorHandler);
}
