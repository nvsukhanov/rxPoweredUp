import { ReactElement } from 'react';
import { Routes } from 'react-router-dom';
import { IHub } from 'rxpoweredup';

import { buildRoutes } from './routes-factory';

export function RouterOutlet(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    const routes = buildRoutes(props.hub);
    return (
        <Routes>
            {routes}
        </Routes>
    );
}
