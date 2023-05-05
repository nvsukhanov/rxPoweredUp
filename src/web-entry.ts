import { connectHub } from './register';
import { LoggingMiddleware } from './middleware';

async function connect(): Promise<void> {
    await connectHub(
        navigator.bluetooth,
        [ new LoggingMiddleware(console, 'all') ],
        [ new LoggingMiddleware(console, 'all') ]
    );
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('connect')?.addEventListener('click', () => connect());
});
