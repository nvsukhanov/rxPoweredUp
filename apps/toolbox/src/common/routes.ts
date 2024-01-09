export const ROUTES = {
    root: '/',
    hubProperties: 'hub',
    motors: 'motors',
    ports: 'ports',
} as const satisfies { [k in string]: string };
