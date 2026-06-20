"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function HomePage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.user && data.user.hasPaid) {
                        setIsLoggedIn(true);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </main>
        );
    }

    if (isLoggedIn) {
        router.push("/dashboard");
        return null;
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span className={styles.logo}>فیت‌بانو</span>
                <button
                    className={styles.loginBtn}
                    onClick={() => router.push("/login")}
                >
                    ورود
                </button>
            </header>

            <section className={styles.hero}>
                <span className={styles.eyebrow}>برنامه‌ساز اختصاصی خانم‌ها</span>
                <h1 className={styles.title}>
                    برنامه‌ی غذایی و ورزشی <span>مخصوص بدن تو</span>
                </h1>
                <p className={styles.subtitle}>
                    با پاسخ به چند سوال ساده، یک برنامه‌ی شخصی‌سازی‌شده دریافت کن که
                    متناسب با هدف، سطح فعالیت و شرایط بدنی توست.
                </p>

                <div className={styles.startCard}>
                    <span className={styles.startCardTag}>۲ دقیقه زمان لازم است</span>
                    <h2 className={styles.startCardTitle}>
                        شروع برنامه‌ی شخصی‌سازی‌شده
                    </h2>
                    <p className={styles.startCardDesc}>
                        با چند سوال کوتاه، برنامه‌ی غذایی و ورزشی متناسب با خودت رو دریافت
                        کن.
                    </p>
                    <button
                        className={styles.startCardBtn}
                        onClick={() => router.push("/quiz")}
                    >
                        شروع کن
                    </button>
                </div>

                <div className={styles.trust}>
                    <div className={styles.trustItem}>
                        <span className={styles.trustNumber}>+۲۵۰هزار</span>
                        <span>کاربر</span>
                    </div>
                    <div className={styles.trustItem}>
                        <span className={styles.trustNumber}>۴.۹</span>
                        <span>امتیاز</span>
                    </div>
                    <div className={styles.trustItem}>
                        <span className={styles.trustNumber}>۱۰۰٪</span>
                        <span>اختصاصی</span>
                    </div>
                </div>
            </section>
        </main>
    );
}