import { ReactElement, useState } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './Nav.module.scss';
import { HubConnectionState, ROUTES } from '../../Common';

export function Nav(props: { connectionState: HubConnectionState; onConnect: (useLinuxWorkaround: boolean) => void; onDisconnect: () => void }): ReactElement {
  const [useLinuxWorkaround, setUseLinuxWorkaround] = useState(false);

  const navItems: ReactElement[] = [];
  if ([HubConnectionState.Connected, HubConnectionState.Disconnecting].includes(props.connectionState)) {
    navItems.push(
      <button onClick={props.onDisconnect} disabled={props.connectionState !== HubConnectionState.Connected}>
        Disconnect
      </button>,
      <NavLink to={ROUTES.hubProperties} className={({ isActive }): string => (isActive ? styles['linkItem_active'] : styles['linkItem'])}>
        Hub properties
      </NavLink>,
      <NavLink to={ROUTES.ports} className={({ isActive }): string => (isActive ? styles['linkItem_active'] : styles['linkItem'])}>
        Ports
      </NavLink>,
      <NavLink to={ROUTES.motors} className={({ isActive }): string => (isActive ? styles['linkItem_active'] : styles['linkItem'])}>
        Motors
      </NavLink>,
      <NavLink to={ROUTES.latency} className={({ isActive }): string => (isActive ? styles['linkItem_active'] : styles['linkItem'])}>
        Latency
      </NavLink>,
      <NavLink to={ROUTES.ledColor} className={({ isActive }): string => (isActive ? styles['linkItem_active'] : styles['linkItem'])}>
        Led Color
      </NavLink>
    );
  } else {
    navItems.push(
      <button onClick={() => props.onConnect(useLinuxWorkaround)} disabled={props.connectionState === HubConnectionState.Connecting}>
        Connect
      </button>
    );
    navItems.push(
      <>
        <input type={'checkbox'} checked={useLinuxWorkaround} id={'use-linux-workaround'} onChange={(event) => setUseLinuxWorkaround(event.target.checked)} />
        <label className={styles['useLinuxWorkaroundLabel']} htmlFor={'use-linux-workaround'}>
          Use Linux workaround
        </label>
      </>
    );
  }

  return (
    <nav>
      <ol className={styles['navList']}>
        {navItems.map((navItem, index) => (
          <li key={index}>{navItem}</li>
        ))}
      </ol>
    </nav>
  );
}
