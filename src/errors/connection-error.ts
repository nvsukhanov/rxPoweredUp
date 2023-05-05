export class ConnectionError extends Error {
    public readonly type = 'Connection error';

    constructor(
        message: string,
        public readonly l10nKey: string,
        public readonly translationParams: object = {}
    ) {
        super(message);
    }
}
