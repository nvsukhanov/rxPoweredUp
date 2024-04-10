import { ReactElement, useState } from 'react';
import { concat, finalize } from 'rxjs';
import { IHub } from 'rxpoweredup';

export function ServoSequence(
    props: {
        hub: IHub;
        portId: number | undefined;
    }
): ReactElement {
    const [ isCommandRunning, setIsCommandRunning ] = useState<boolean>(false);

    function handleRunClick(): void {
        if (props.portId === undefined) {
            return;
        }
        setIsCommandRunning(true);
        concat(
            props.hub.motors.goToPosition(props.portId, 2000, { speed: 30 }),
            props.hub.motors.goToPosition(props.portId, 0),
        ).pipe(
            finalize(() => setIsCommandRunning(false))
        ).subscribe();
    }

    return (
        <section>
            <button disabled={props.portId === undefined || isCommandRunning}
                    onClick={handleRunClick}
            >Run
            </button>
        </section>
    );
}
