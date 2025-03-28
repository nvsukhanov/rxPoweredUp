import { ReactElement, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { IHub } from 'rxpoweredup';

import { PhysicalPortState, useHubStore } from '../../../Store';
import { PhysicalPort } from '../PhysicalPort';
import { HubIsNotConnectedNotification } from '../../../Components';

export function PortsList(props: { hub: IHub }): ReactElement {
  const ports = useHubStore(useShallow((state) => state.ports));
  const physicalPorts = Object.values(ports).filter((port): port is PhysicalPortState => port.isPhysical);

  const processPortModeMessage = useHubStore((state) => state.processPortModeMessage);

  const handlePortModesRequest = useCallback(
    (portId: number): void => {
      props.hub?.ports.getPortModes(portId).subscribe((r) => processPortModeMessage(r));
    },
    [props.hub, processPortModeMessage]
  );

  if (!props.hub) {
    return <HubIsNotConnectedNotification />;
  }

  const physicalPortElements: ReactElement[] = physicalPorts.map((port: PhysicalPortState) => {
    return (
      <li key={port.portId}>
        <PhysicalPort hub={props.hub} port={port} onHandlePortModesRequest={(): void => handlePortModesRequest(port.portId)} />
      </li>
    );
  });
  return (
    <>
      <h3>Physical ports</h3>
      <ul>{physicalPortElements}</ul>
    </>
  );
}
