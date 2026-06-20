"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface ExerciseItem {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
    gifUrl?: string;
    description?: string;
}

interface WorkoutItem {
    day: number;
    sets: number;
    reps: string;
    exerciseItem: ExerciseItem;
}

interface WorkoutPlan {
    id: string;
    weeklySplit: string;
    items: WorkoutItem[];
}

const dayNames = [
    "روز اول",
    "روز دوم",
    "روز سوم",
    "روز چهارم",
    "روز پنجم",
    "روز ششم",
];

export default function WorkoutPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(1);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.workoutPlan) {
                    setPlan(data.workoutPlan);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </main>
        );
    }

    if (!plan) {
        return (
            <main className={styles.page}>
                <div className={styles.emptyState}>
                    <p>برنامه‌ی ورزشی هنوز ساخته نشده</p>
                    <button onClick={() => router.push("/dashboard")}>بازگشت</button>
                </div>
            </main>
        );
    }

    const splitLabels = plan.weeklySplit.split(" | ");
    const dayExercises = plan.items.filter((item) => item.day === selectedDay);
    const totalDays = Math.max(...plan.items.map((item) => item.day));

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/dashboard")}
                >
                    →
                </button>
                <span className={styles.headerTitle}>برنامه ورزشی</span>
                <div />
            </header>

            <section className={styles.content}>
                <div className={styles.splitCard}>
                    <span className={styles.splitLabel}>تقسیم‌بندی هفتگی</span>
                    <span className={styles.splitValue}>{plan.weeklySplit}</span>
                </div>

                {/* Day selector */}
                <div className={styles.dayTabs}>
                    {Array.from({ length: totalDays }).map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.dayTab} ${
                                selectedDay === i + 1 ? styles.dayTabActive : ""
                            }`}
                            onClick={() => setSelectedDay(i + 1)}
                        >
              <span className={styles.dayTabName}>
                {dayNames[i] || `روز ${i + 1}`}
              </span>
                            {splitLabels[i] && (
                                <span className={styles.dayTabSplit}>{splitLabels[i]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Exercises */}
                <div className={styles.exercises}>
                    {dayExercises.map((item, idx) => (
                        <div key={idx} className={styles.exerciseCard}>
                            <div className={styles.exerciseTop}>
                                <div className={styles.exerciseNumber}>{idx + 1}</div>
                                <div className={styles.exerciseInfo}>
                                    <h3 className={styles.exerciseName}>
                                        {item.exerciseItem.name}
                                    </h3>
                                    <div className={styles.exerciseMeta}>
                    <span className={styles.metaTag}>
                      {item.exerciseItem.muscleGroup}
                    </span>
                                        <span className={styles.metaTag}>
                      {item.exerciseItem.difficulty}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {item.exerciseItem.description && (
                                <p className={styles.exerciseDesc}>
                                    {item.exerciseItem.description}
                                </p>
                            )}

                            <div className={styles.setsReps}>
                                <div className={styles.setRepItem}>
                                    <span className={styles.setRepValue}>{item.sets}</span>
                                    <span className={styles.setRepLabel}>ست</span>
                                </div>
                                <div className={styles.setRepDivider} />
                                <div className={styles.setRepItem}>
                                    <span className={styles.setRepValue}>{item.reps}</span>
                                    <span className={styles.setRepLabel}>تکرار</span>
                                </div>
                            </div>

                            {item.exerciseItem.gifUrl && (
                                <div className={styles.gifContainer}>
                                    <img
                                        src={item.exerciseItem.gifUrl}
                                        alt={item.exerciseItem.name}
                                        className={styles.gif}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}