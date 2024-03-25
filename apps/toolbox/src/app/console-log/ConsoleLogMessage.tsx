import { ReactElement } from 'react';
import { LogLevel } from 'rxpoweredup';

import { ConsoleLogEntry } from '../../store';
import styles from './ConsoleLogMessage.module.scss';

export function ConsoleLogMessage(
    props: {
        message: ConsoleLogEntry;
    }
): ReactElement {
    const dateTimestamp = new Date(props.message.timestamp);
    const formattedHours = dateTimestamp.getHours().toString().padStart(2, '0');
    const formattedMinutes = dateTimestamp.getMinutes().toString().padStart(2, '0');
    const formattedSeconds = dateTimestamp.getSeconds().toString().padStart(2, '0');
    const formattedMilliseconds = dateTimestamp.getMilliseconds().toString().padStart(3, '0');
    const formattedDate = `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
    return (
        <>
            <div className={styles['timestampCell']}>{formattedDate}</div>
            <div>{LogLevel[props.message.logLevel]}</div>
            <div>{props.message.message}</div>
        </>
    );
}
