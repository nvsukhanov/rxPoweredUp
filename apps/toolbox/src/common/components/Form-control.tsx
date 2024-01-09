import { ReactElement } from 'react';

import styles from './Form-controls.module.scss';

export function FormControl(
    props: {
        children: ReactElement | ReactElement[];
    }
): ReactElement {
    return (
        <section className={styles.formControlsContainer}>
            {props.children}
        </section>
    );
}
