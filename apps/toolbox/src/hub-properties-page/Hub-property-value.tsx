import { ReactElement } from 'react';

import styles from './Hub-property-value.module.scss';

export function HubPropertyValue(
    props: {
        name: string;
        value: string;
        isSubscribed?: boolean;
        onRead?: () => void;
        onSubscribe?: () => void;
        onUnsubscribe?: () => void;
    }
): ReactElement {
    return (
        <>
            <div className={styles.hubPropertyName}>
                {props.name}
            </div>
            <div className={styles.hubPropertyValue}>
                {props.value}
            </div>
            <div className={styles.hubPropertyActions}>
                <button type="button" onClick={props.onRead} disabled={!props.onRead}>Read</button>
                {props.isSubscribed
                 ? <button type="button" onClick={props.onUnsubscribe}>Unsubscribe</button>
                 : <button type="button" onClick={props.onSubscribe} disabled={!props.onSubscribe}>Subscribe</button>
                }
            </div>
        </>
    );
}
