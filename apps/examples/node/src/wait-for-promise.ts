export function waitForPromise(p: Promise<unknown>): void {
  const timeout = setTimeout(() => void 0, 0x7fffffff);
  p.then(() => clearTimeout(timeout));
}
