import { Route } from 'react-router-dom';
import { ReactElement } from 'react';

import { IHub } from 'rxpoweredup';
import { HubPropertiesPage } from '../hub-properties-page';
import { ROUTES } from '../common';
import { MotorPage } from '../motors-page';
import { PortsPage } from '../ports-page';
import { LatencyPage } from '../latency-page';

export function buildRoutes(
    hub: IHub | undefined
): ReactElement[] {
    return [
        <Route path={ROUTES.root}
               element={null}
               key={ROUTES.root}
        />,
        <Route path={ROUTES.hubProperties}
               key={ROUTES.hubProperties}
               element={<HubPropertiesPage hub={hub}/>}
        />,
        <Route path={ROUTES.ports}
               key={ROUTES.ports}
               element={<PortsPage hub={hub}/>}
        />,
        <Route path={ROUTES.motors}
               key={ROUTES.motors}
               element={<MotorPage hub={hub}/>}
        />,
        <Route path={ROUTES.latency}
               key={ROUTES.latency}
               element={<LatencyPage hub={hub}/>}
        />
    ];
}
