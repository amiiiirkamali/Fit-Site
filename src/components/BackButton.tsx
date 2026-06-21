"use client";

import styles from "./BackButton.module.css";

interface Props {
    onClick: () => void;
}

export default function BackButton({ onClick }: Props) {
    return (
        <button className={styles.btn} onClick={onClick} aria-label="بازگشت">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    );
}