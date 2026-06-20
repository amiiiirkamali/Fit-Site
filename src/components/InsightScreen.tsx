"use client";

import styles from "./InsightScreen.module.css";

interface Props {
    title: string;
    text: string;
    icon?: string;
}

export default function InsightScreen({ title, text, icon }: Props) {
    return (
        <div className={styles.container}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
        </div>
    );
}