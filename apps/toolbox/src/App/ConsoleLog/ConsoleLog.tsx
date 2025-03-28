import { ReactElement } from 'react';

import { useHubStore } from '../../Store';
import styles from './ConsoleLog.module.scss';
import { ConsoleLogItem } from '../ConsoleLogItem';

export function ConsoleLog(): ReactElement {
  const messages = useHubStore((state) => state.consoleLog);
  return (
    <>
      <section className={styles['messagesHeader']}>
        <div>Timestamp</div>
        <div>Level</div>
        <div>Message</div>
      </section>
      <section className={styles['messagesContainer']}>
        {[...messages].reverse().map((message) => (
          <ConsoleLogItem key={message.id} message={message} />
        ))}
      </section>
    </>
  );
}
