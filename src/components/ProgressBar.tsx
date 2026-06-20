"use client";

import styles from "./ProgressBar.module.css";

interface Props {
    currentSection: number;
    totalSections: number;
    progressInSection: number; // 0-1
}

export default function ProgressBar({
                                        currentSection,
                                        totalSections,
                                        progressInSection,
                                    }: Props) {
    return (
        <div className={styles.bar}>
            {Array.from({ length: totalSections }).map((_, i) => (
                <div key={i} className={styles.segment}>
                    <div
                        className={styles.fill}
                        style={{
                            width:
                                i < currentSection
                                    ? "100%"
                                    : i === currentSection
                                        ? `${Math.round(progressInSection * 100)}%`
                                        : "0%",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}