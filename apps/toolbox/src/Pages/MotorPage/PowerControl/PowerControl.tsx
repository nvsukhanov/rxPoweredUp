import { ReactElement, useEffect, useRef, useState } from 'react';
import { Subject, takeUntil } from 'rxjs';
import { IHub, PortModeName, WELL_KNOWN_PORT_MODE_IDS } from 'rxpoweredup';

import { ModeIdInput, PowerInput } from '../../../Components';

export function PowerControl(props: { hub: IHub; portId: number | undefined }): ReactElement {
  const [modeId, setModeId] = useState<number | undefined>(WELL_KNOWN_PORT_MODE_IDS.motor[PortModeName.power]);
  const [power, setPower] = useState<number | undefined>(100);
  const disposeRef$ = useRef(new Subject<void>());
  const dispose$ = disposeRef$.current;

  const execute = (): void => {
    if (modeId === undefined || power === undefined || props.portId === undefined) {
      return;
    }
    props.hub.motors.startPower(props.portId, power, modeId).pipe(takeUntil(disposeRef$.current)).subscribe();
  };

  useEffect(() => {
    return (): void => {
      dispose$.next();
      dispose$.complete();
    };
  }, [dispose$]);

  return (
    <>
      <div>
        <ModeIdInput modeId={modeId} onModeIdChange={setModeId} />
      </div>
      <div>
        <PowerInput power={power} onPowerChange={setPower} />
      </div>
      <div>
        <button disabled={props.portId === undefined || modeId === undefined || power === undefined} onClick={execute}>
          Execute
        </button>
      </div>
    </>
  );
}
