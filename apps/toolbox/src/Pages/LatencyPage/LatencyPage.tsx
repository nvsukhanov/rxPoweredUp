import { ReactElement, useState } from 'react';
import { IHub } from 'rxpoweredup';

import { BurstTest } from './BurstTest';
import { SequenceDuration } from './SequenceDuration';

export function LatencyPage(props: { hub: IHub | undefined }): ReactElement {
  const [sequenceDuration, setSequenceDuration] = useState<Array<number | null>>([]);

  const onStart = (sequenceLength: number): void => {
    setSequenceDuration(Array.from({ length: sequenceLength }, () => null));
  };

  const updateSequenceDuration = (index: number, value: number | null): void => {
    setSequenceDuration((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <>
      <h2>Latency Tests</h2>
      {<BurstTest hub={props.hub} updateSequenceDuration={updateSequenceDuration} onStart={onStart} />}
      <SequenceDuration sequenceDuration={sequenceDuration} />
    </>
  );
}
