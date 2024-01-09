import { Observable, Subject, takeUntil } from 'rxjs';
import { ReactElement, useCallback, useEffect, useRef } from 'react';

import { HubPropertiesState, useHubStore } from '../store';
import { HubPropertyValue } from './Hub-property-value';

export function HubReadableProperty<TStateKey extends keyof HubPropertiesState>(
    props: {
        name: string;
        stateKey: TStateKey;
        readValue: () => Observable<HubPropertiesState[TStateKey]>;
        formatValue: (value?: HubPropertiesState[TStateKey]) => string;
    }
): ReactElement {
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const hubPropertiesState = useHubStore((state) => state.hubProperties);
    const setHubProperty = useHubStore((state) => state.setHubProperty);

    useEffect(() => {
        return () => dispose$.next();
    }, [ dispose$ ]);

    const readValue = useCallback(() => {
        const streamFn = props.readValue;
        streamFn().pipe(takeUntil(dispose$)).subscribe((value) => setHubProperty(props.stateKey, value));
    }, [ props.stateKey, props.readValue, setHubProperty, dispose$ ]);

    return (
        <HubPropertyValue name={props.name}
                          value={props.formatValue(hubPropertiesState[props.stateKey])}
                          onRead={readValue}
        />
    );
}
