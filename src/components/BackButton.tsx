"use client";

import styles from "./BackButton.module.css";

interface Props {
    onClick: () => void;
}

export default function BackButton({ onClick }: Props) {
    return (
        <button className={styles.btn} onClick={onClick}>
            →
        </button>
    );
}