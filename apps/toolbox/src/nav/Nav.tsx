import { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';

import styles from './Nav.module.scss';
import { ROUTES } from '../common';
import { HubConnectionState } from '../types';

export function Nav(
    props: {
        connectionState: HubConnectionState;
        onConnect: () => void;
        onDisconnect: () => void;
    }
): ReactElement {
    const navItems: ReactElement[] = [];
    if ([ HubConnectionState.Connected, HubConnectionState.Disconnecting ].includes(props.connectionState)) {
        navItems.push(
            <button onClick={props.onDisconnect}
                    disabled={props.connectionState !== HubConnectionState.Connected}
            >Disconnect</button>,
            <NavLink to={ROUTES.hubProperties}
                     className={({ isActive }): string => isActive ? styles.activeLinkItem : ''}
            >
                Hub properties
            </NavLink>,
            <NavLink to={ROUTES.ports}
                     className={({ isActive }): string => isActive ? styles.activeLinkItem : ''}
            >
                Ports
            </NavLink>,
            <NavLink to={ROUTES.motors}
                     className={({ isActive }): string => isActive ? styles.activeLinkItem : ''}
            >
                Motors
            </NavLink>,
        );
    } else {
        navItems.push(
            <button onClick={props.onConnect}
                    disabled={props.connectionState === HubConnectionState.Connecting}
            >Connect</button>
        );
    }

    return (
        <nav>
            <ol className={styles.navList}>
                {navItems.map((navItem, index) => <li key={index}>{navItem}</li>)}
            </ol>
        </nav>
    );
}
