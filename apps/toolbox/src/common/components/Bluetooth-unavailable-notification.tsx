import { ReactElement } from 'react';

export function BluetoothUnavailableNotification(): ReactElement {
    return (
        <>
            <p>It appears that your browser does not support the Web Bluetooth API</p>
            <p>For more information please refer to <a href={'https://caniuse.com/web-bluetooth'}>https://caniuse.com/web-bluetooth</a></p>
        </>
    );
}
