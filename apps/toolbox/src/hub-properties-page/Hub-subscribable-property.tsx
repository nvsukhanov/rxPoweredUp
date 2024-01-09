import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';

import { HubPropertiesState, useHubStore } from '../store';
import { HubPropertyValue } from './Hub-property-value';

export function HubSubscribableProperty<TStateKey extends keyof HubPropertiesState>(
    props: {
        name: string;
        stateKey: TStateKey;
        readValue: () => Observable<HubPropertiesState[TStateKey]>;
        subscribeValue: () => Observable<HubPropertiesState[TStateKey]>;
        formatValue: (value?: HubPropertiesState[TStateKey]) => string;
    }
): ReactElement {
    const disposeRef = useRef(new Subject<void>());
    const dispose$ = disposeRef.current;
    const unsubscribeRef = useRef(new Subject<void>());
    const unsubscribe$ = unsubscribeRef.current;
    const hubPropertiesState = useHubStore((state) => state.hubProperties);
    const setHubProperty = useHubStore((state) => state.setHubProperty);
    const [ isSubscribed, setIsSubscribed ] = useState<boolean>(false);

    useEffect(() => {
        return () => dispose$.next();
    }, [ dispose$ ]);

    const readValue = useCallback(() => {
        const streamFn = props.readValue;
        streamFn().pipe(takeUntil(dispose$)).subscribe((value) => setHubProperty(props.stateKey, value));
    }, [ props.stateKey, props.readValue, setHubProperty, dispose$ ]);

    const subscribeToValue = useCallback(() => {
        if (isSubscribed) {
            return;
        }
        setIsSubscribed(true);
        const subscribeFn = props.subscribeValue;
        subscribeFn().pipe(
            takeUntil(dispose$),
            takeUntil(unsubscribe$),
            finalize(() => setIsSubscribed(false))
        ).subscribe((value) => setHubProperty(props.stateKey, value));
    }, [ props.stateKey, props.subscribeValue, setHubProperty, dispose$, unsubscribe$, isSubscribed, setIsSubscribed ]);

    const unsubscribeFromValue = useCallback(() => unsubscribe$.next(), [ unsubscribe$ ]);

    return (
        <HubPropertyValue name={props.name}
                          value={props.formatValue(hubPropertiesState[props.stateKey])}
                          isSubscribed={isSubscribed}
                          onRead={readValue}
                          onSubscribe={subscribeToValue}
                          onUnsubscribe={unsubscribeFromValue}
        />
    );
}
