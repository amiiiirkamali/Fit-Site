"use client";

import styles from "./ProgressBar.module.css";

interface Props {
    current: number;
    total: number;
}

export default function ProgressBar({ current, total }: Props) {
    const totalProgress = total > 0 ? ((current + 1) / total) * 100 : 0;

    return (
        <div className={styles.wrap}>
            {[0, 1, 2, 3].map((i) => {
                const segStart = i * 25;
                const segEnd = (i + 1) * 25;
                let fill = 0;
                if (totalProgress >= segEnd) fill = 1;
                else if (totalProgress > segStart)
                    fill = (totalProgress - segStart) / 25;
                else fill = 0;

                return (
                    <div key={i} className={styles.bar}>
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
