import { ReactElement } from 'react';

import { useHubStore } from '../../store';
import styles from './ConsoleLog.module.scss';
import { ConsoleLogMessage } from './ConsoleLogMessage.tsx';

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
                {
                    [ ...messages ].reverse().map((message) => (
                        <ConsoleLogMessage key={message.id} message={message}/>
                    ))
                }
            </section>
        </>
    );
}
