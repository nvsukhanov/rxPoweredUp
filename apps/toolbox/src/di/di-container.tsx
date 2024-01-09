import { ReactElement, useContext } from 'react';

import { DiContext } from './di-context.ts';
import {
    ClassProviderWithToken,
    FactoryProviderWithToken,
    InjectionProviderWithToken,
    TokenProviderWithToken,
    ValueProviderWithToken
} from './injection-provider-with-token.ts';

function isValueProviderWithToken<T>(provider: InjectionProviderWithToken<T>): provider is ValueProviderWithToken<T> {
    return (provider as ValueProviderWithToken<T>).useValue !== undefined;
}

function isFactoryProviderWithToken<T>(provider: InjectionProviderWithToken<T>): provider is FactoryProviderWithToken<T> {
    return (provider as FactoryProviderWithToken<T>).useFactory !== undefined;
}

function isTokenProviderWithToken<T>(provider: InjectionProviderWithToken<T>): provider is TokenProviderWithToken<T> {
    return (provider as TokenProviderWithToken<T>).useToken !== undefined;
}

function isClassProviderWithToken<T>(provider: InjectionProviderWithToken<T>): provider is ClassProviderWithToken<T> {
    return (provider as ClassProviderWithToken<T>).useClass !== undefined;
}

export function DiContainer(
    props: {
        providers: ReadonlyArray<InjectionProviderWithToken<unknown>>;
        children: ReactElement[] | ReactElement;
    }
): ReactElement {
    const parentContainer = useContext(DiContext);
    const childContainer = parentContainer.createChildContainer();
    props.providers.forEach((provider) => {
        if (isValueProviderWithToken(provider)) {
            childContainer.register(provider.provide, provider);
        } else if (isFactoryProviderWithToken(provider)) {
            childContainer.register(provider.provide, provider);
        } else if (isTokenProviderWithToken(provider)) {
            childContainer.register(provider.provide, provider, provider.options);
        } else if (isClassProviderWithToken(provider)) {
            childContainer.register(provider.provide, provider, provider.options);
        } else {
            throw new Error('Invalid provider');
        }
    });
    return (
        <DiContext.Provider value={childContainer}>
            {props.children}
        </DiContext.Provider>
    );
}
