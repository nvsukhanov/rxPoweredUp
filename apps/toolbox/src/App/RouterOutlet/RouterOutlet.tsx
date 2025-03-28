import { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { IHub } from 'rxpoweredup';

import { ROUTES } from '../../Common';
import { HubPropertiesPage, LatencyPage, LedColorPage, MotorPage, PortsPage } from '../../Pages';

export function RouterOutlet(props: { hub: IHub | undefined }): ReactElement {
  return (
    <Routes>
      <Route path={ROUTES.root} element={null} key={ROUTES.root} />
      ,
      <Route path={ROUTES.hubProperties} key={ROUTES.hubProperties} element={<HubPropertiesPage hub={props.hub} />} />
      ,
      <Route path={ROUTES.ports} key={ROUTES.ports} element={<PortsPage hub={props.hub} />} />
      ,
      <Route path={ROUTES.motors} key={ROUTES.motors} element={<MotorPage hub={props.hub} />} />
      ,
      <Route path={ROUTES.latency} key={ROUTES.latency} element={<LatencyPage hub={props.hub} />} />
      ,
      <Route path={ROUTES.ledColor} key={ROUTES.ledColor} element={<LedColorPage hub={props.hub} />} />
    </Routes>
  );
}
