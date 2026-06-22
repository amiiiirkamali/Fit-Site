"use client";

import styles from "./BehaviorProfile.module.css";

interface Props {
    title: string;
    description: string;
    nextSteps: string;
}

export default function BehaviorProfile({ title, description, nextSteps }: Props) {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.nextBox}>
                <h3 className={styles.nextLabel}>مراحل بعدی</h3>
                <p className={styles.nextText}>{nextSteps}</p>
            </div>
        </div>
    );
}
