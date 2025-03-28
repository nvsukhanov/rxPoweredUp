export const ROUTES = {
  root: '/',
  hubProperties: 'hub',
  motors: 'motors',
  ports: 'ports',
  latency: 'latency',
  ledColor: 'led-color',
} as const satisfies { [k in string]: string };
