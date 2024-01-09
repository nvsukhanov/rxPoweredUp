import { DependencyContainer, InjectionToken, RegistrationOptions } from 'tsyringe';

type constructor<T> = {
    new(...args: unknown[]): T;
};

export type ValueProviderWithToken<T> = {
    provide: InjectionToken<T>;
    useValue: T;
};

export type FactoryProviderWithToken<T> = {
    provide: InjectionToken<T>;
    useFactory: (dependencyContainer: DependencyContainer) => T;
};

export type TokenProviderWithToken<T> = {
    provide: InjectionToken<T>;
    useToken: InjectionToken<T>;
    options?: RegistrationOptions;
};

export type ClassProviderWithToken<T> = {
    provide: InjectionToken<T>;
    useClass: constructor<T>;
    options?: RegistrationOptions;
};

export type InjectionProviderWithToken<T = unknown> =
    ValueProviderWithToken<T>
    | FactoryProviderWithToken<T>
    | TokenProviderWithToken<T>
    | ClassProviderWithToken<T>;
