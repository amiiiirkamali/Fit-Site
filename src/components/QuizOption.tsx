"use client";

import styles from "./QuizOption.module.css";

interface Props {
    label: string;
    icon?: string;
    selected: boolean;
    onClick: () => void;
}

export default function QuizOption({ label, icon, selected, onClick }: Props) {
    return (
        <button
            className={`${styles.option} ${selected ? styles.selected : ""}`}
            onClick={onClick}
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.label}>{label}</span>
        </button>
    );
}