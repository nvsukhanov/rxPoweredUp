import { ReactElement } from 'react';

export function SequenceDuration(props: { sequenceDuration: Array<number | null> }): ReactElement {
  const cumulativeDuration = props.sequenceDuration.filter((p): p is number => p !== null).reduce((a, b) => a + b, 0);
  const hasResult = props.sequenceDuration.some((p): p is number => p !== null);

  return (
    <div>
      <label>Sequence duration</label>
      <div>
        {props.sequenceDuration.map((duration, index) => (
          <div key={index}>
            {index}: {duration !== null ? duration : 'pending'}
          </div>
        ))}
      </div>
      <div>{hasResult ? <>Cumulative: {cumulativeDuration}ms</> : null}</div>
    </div>
  );
}
