import { ReactElement, useEffect } from 'react';

import { IHub } from 'rxpoweredup';
import { HubNotConnectedNotification } from '../common';
import { useHubStore } from '../store';
import { PortsList } from './Ports-list';

export function PortsPage(
    props: {
        hub: IHub | undefined;
    }
): ReactElement {
    const processIoAttach = useHubStore((state) => state.processIoAttachMessage);
    const processIoDetach = useHubStore((state) => state.processIoDetachMessage);

    useEffect((): void | (() => void) => {
        if (props.hub) {
            const portAddSub = props.hub.ports.onIoAttach().subscribe((v) => processIoAttach(v));
            const portRemoveSub = props.hub.ports.onIoDetach().subscribe((v) => processIoDetach(v));
            return () => {
                portAddSub.unsubscribe();
                portRemoveSub.unsubscribe();
            };
        }
    }, [ props.hub, processIoAttach, processIoDetach ]);

    if (!props.hub) {
        return (<HubNotConnectedNotification/>);
    }

    return (
        <>
            <h2>Ports</h2>
            <PortsList hub={props.hub}/>
        </>

    );
}
