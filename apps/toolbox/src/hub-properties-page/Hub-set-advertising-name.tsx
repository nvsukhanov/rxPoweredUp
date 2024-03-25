import { ChangeEvent, FormEvent, ReactElement, useId, useRef, useState } from 'react';
import { Subject, finalize, takeUntil } from 'rxjs';
import { IHub } from 'rxpoweredup';

import styles from './Hub-set-advertising-name.module.scss';
import { useHubStore } from '../store';

export function HubSetAdvertisingName(
    props: {
        name: string;
        hub: IHub;
    }
): ReactElement {
    const id = useId();
    const [ name, setName ] = useState('');
    const [ inputNameDirty, setInputNameDirty ] = useState(false);
    const [ isSettingsName, setIsSettingsName ] = useState(false);
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const setHubProperty = useHubStore((state) => state.setHubProperty);

    if (props.name !== name && !inputNameDirty) {
        setName(props.name);
    }
    const canSubmit = name.length > 0
        && name.length <= 14
        && name.match(/^[a-zA-Z0-9\s-]+$/) !== null
        && name !== props.name
        && !isSettingsName;

    function handleFormSubmit(event?: FormEvent<HTMLFormElement>): void {
        event?.preventDefault();
        if (!canSubmit) {
            return;
        }
        setIsSettingsName(true);
        props.hub.properties.setHubAdvertisingName(name).pipe(
            takeUntil(dispose$),
            finalize(() => setIsSettingsName(false))
        ).subscribe(() => setHubProperty('advertisingName', name));
    }

    function handleNameChange(
        event: ChangeEvent<HTMLInputElement>
    ): void {
        setName(event.target.value);
        setInputNameDirty(true);
    }

    return (
        <form onSubmit={handleFormSubmit}
              className={styles['advertisementNameForm']}
        >
            <label htmlFor={id}>Advertisement name</label>
            <input id={id}
                   type={'text'}
                   minLength={1}
                   maxLength={14}
                   placeholder={'Enter new name'}
                   value={name}
                   onChange={handleNameChange}
            />
            <button disabled={!canSubmit}>
                Submit
            </button>
        </form>
    );
}
