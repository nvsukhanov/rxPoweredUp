import { ReactElement } from 'react';

import { useHubStore } from '../../Store';
import styles from './MessagesLog.module.scss';
import { MessagesLogItem } from '../MessageLogItem';

export function MessagesLog(): ReactElement {
  const messages = useHubStore((state) => state.messagesLog);
  return (
    <>
      <section className={styles['messagesHeader']}>
        <div>Timestamp</div>
        <div>Direction</div>
        <div>Type</div>
        <div>Data (hex)</div>
      </section>
      <section className={styles['messagesContainer']}>
        {[...messages].reverse().map((message) => (
          <MessagesLogItem key={message.id} message={message} />
        ))}
      </section>
    </>
  );
}
