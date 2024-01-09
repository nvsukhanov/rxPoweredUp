import { ChangeEvent, ReactElement, useId } from 'react';

export function NoFeedbackInput(
    props: {
        noFeedback: boolean | undefined;
        onNoFeedbackChange: (noFeedback: boolean) => void;
    }
): ReactElement {
    const noFeedbackId = useId();

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        props.onNoFeedbackChange(event.target.checked);
    };

    return (
        <>
            <input id={noFeedbackId}
                   type="checkbox"
                   checked={!!props.noFeedback}
                   onChange={handleChange}
            />
            <label htmlFor={noFeedbackId}>No feedback</label>
        </>
    );
}
