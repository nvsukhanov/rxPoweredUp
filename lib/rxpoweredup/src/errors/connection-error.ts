export class ConnectionError extends Error {
  public readonly type = 'Connection error';

  constructor(message: string) {
    super(message);
  }
}
