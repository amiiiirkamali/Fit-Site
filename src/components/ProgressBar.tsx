"use client";

import styles from "./ProgressBar.module.css";

interface Props {
    currentSection: number;
    totalSections: number;
    progressInSection: number; // 0 to 1
}

export default function ProgressBar({
                                        currentSection,
                                        totalSections,
                                        progressInSection,
                                    }: Props) {
    return (
        <div className={styles.wrap}>
            {Array.from({ length: totalSections }).map((_, idx) => {
                const sectionNum = idx + 1;
                let fill = 0;
                if (sectionNum < currentSection) fill = 1;
                else if (sectionNum === currentSection) fill = progressInSection;
                else fill = 0;

                return (
                    <div key={idx} className={styles.bar}>
                        <div
                            className={styles.fill}
                            style={{ width: `${fill * 100}%` }}
                        />
                    </div>
                );
            })}
        </div>
    );
}