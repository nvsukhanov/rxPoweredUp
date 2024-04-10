import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app';
import './index.css';
import { DiContainer, ERROR_HANDLER, ErrorHandler, InjectionProviderWithToken, NAVIGATOR, WINDOW } from './common';

const ROOT_PROVIDERS: Array<InjectionProviderWithToken> = [
    { provide: WINDOW, useValue: window },
    { provide: NAVIGATOR, useValue: navigator },
    { provide: ERROR_HANDLER, useClass: ErrorHandler }
];

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <DiContainer providers={ROOT_PROVIDERS}>
                <App/>
            </DiContainer>
        </BrowserRouter>
    </StrictMode>,
);
