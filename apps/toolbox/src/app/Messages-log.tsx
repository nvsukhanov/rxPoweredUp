import { ReactElement } from 'react';

import { useHubStore } from '../store';
import styles from './Messages-log.module.scss';
import { MessagesLogEntry } from './Messages-log-entry';

export function MessagesLog(): ReactElement {
    const messages = useHubStore((state) => state.messagesLog);
    return (
        <section className={styles.wrapper}>
            <section className={styles.messagesHeader}>
                <div>Timestamp</div>
                <div>Direction</div>
                <div>Type</div>
                <div>Data (hex)</div>
            </section>
            <section className={styles.messagesContainer}>
                {
                    [ ...messages ].reverse().map((message) => (
                        <MessagesLogEntry key={message.id} message={message}/>
                    ))
                }
            </section>
        </section>
    );
}
