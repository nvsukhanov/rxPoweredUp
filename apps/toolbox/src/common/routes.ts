export const ROUTES = {
    root: '/',
    hubProperties: 'hub',
    motors: 'motors',
    ports: 'ports',
    latency: 'latency',
} as const satisfies { [k in string]: string };
