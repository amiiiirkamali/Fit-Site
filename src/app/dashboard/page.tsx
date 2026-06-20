"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface UserData {
    phone: string;
    hasPaid: boolean;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.user && data.user.hasPaid) {
                    setUser(data.user);
                } else {
                    router.push("/");
                }
                setLoading(false);
            })
            .catch(() => {
                router.push("/login");
                setLoading(false);
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span className={styles.logo}>فیت‌بانو</span>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    خروج
                </button>
            </header>

            <section className={styles.content}>
                <div className={styles.welcome}>
                    <span className={styles.welcomeIcon}>👋</span>
                    <h1 className={styles.welcomeTitle}>سلام!</h1>
                    <p className={styles.welcomeSubtitle}>
                        برنامه‌های اختصاصی تو آماده‌ست
                    </p>
                </div>

                <div className={styles.cards}>
                    <button
                        className={styles.card}
                        onClick={() => router.push("/dashboard/diet")}
                    >
                        <div className={styles.cardIcon}>🥗</div>
                        <div className={styles.cardInfo}>
                            <h2 className={styles.cardTitle}>برنامه غذایی</h2>
                            <p className={styles.cardDesc}>
                                وعده‌های غذایی روزانه متناسب با کالری هدفت
                            </p>
                        </div>
                        <span className={styles.cardArrow}>←</span>
                    </button>

                    <button
                        className={styles.card}
                        onClick={() => router.push("/dashboard/workout")}
                    >
                        <div className={styles.cardIcon}>💪</div>
                        <div className={styles.cardInfo}>
                            <h2 className={styles.cardTitle}>برنامه ورزشی</h2>
                            <p className={styles.cardDesc}>
                                تمرینات هفتگی با گیف آموزشی و جزئیات کامل
                            </p>
                        </div>
                        <span className={styles.cardArrow}>←</span>
                    </button>
                </div>
            </section>
        </main>
    );
}