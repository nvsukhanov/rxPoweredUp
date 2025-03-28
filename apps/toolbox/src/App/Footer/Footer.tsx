import { ReactElement, useState } from 'react';

import { MessagesLog } from '../MessageLog';
import { ConsoleLog } from '../ConsoleLog';
import styles from './Footer.module.scss';

enum DisplayMode {
  Messages,
  Console,
}

export function Footer(): ReactElement {
  const [displayMode, setDisplayMode] = useState(DisplayMode.Messages);
  return (
    <section>
      <section className={styles['header']}>
        <input
          type={'radio'}
          id={'displayMessages'}
          name={'displayMode'}
          checked={displayMode === DisplayMode.Messages}
          onChange={() => setDisplayMode(DisplayMode.Messages)}
        />
        <label htmlFor={'displayMessages'}>Messages</label>
        <input
          type={'radio'}
          id={'displayConsole'}
          name={'displayMode'}
          checked={displayMode === DisplayMode.Console}
          onChange={() => setDisplayMode(DisplayMode.Console)}
        />
        <label htmlFor={'displayConsole'}>Console</label>
      </section>
      <section className={styles['messagesContainer']}>{displayMode === DisplayMode.Console ? <ConsoleLog /> : <MessagesLog />}</section>
    </section>
  );
}
