import { ReactElement } from 'react';

import { MessageType } from 'rxpoweredup';
import { MessageDirection, MessageLogEntry } from '../store';
import { numberToHex } from '../common';
import styles from './Messages-log-entry.module.scss';

export function MessagesLogEntry(
    props: {
        message: MessageLogEntry;
    }
): ReactElement {
    const dateTimestamp = new Date(props.message.timestamp);
    const formattedHours = dateTimestamp.getHours().toString().padStart(2, '0');
    const formattedMinutes = dateTimestamp.getMinutes().toString().padStart(2, '0');
    const formattedSeconds = dateTimestamp.getSeconds().toString().padStart(2, '0');
    const formattedMilliseconds = dateTimestamp.getMilliseconds().toString().padStart(3, '0');
    const formattedDate = `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
    const formattedDirection = props.message.direction === MessageDirection.Inbound ? 'in' : 'out';
    const formattedPayload = props.message.payload.map((n) => numberToHex(n)).join(' ');
    return (
        <>
            <div className={styles.timestampCell}>{formattedDate}</div>
            <div>{formattedDirection}</div>
            <div>{MessageType[props.message.messageType]}</div>
            <div className={styles.rawValueCell}>{formattedPayload}</div>
        </>
    );
}
