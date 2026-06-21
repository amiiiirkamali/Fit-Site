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
    const [currentTime, setCurrentTime] = useState("");
    const [greeting, setGreeting] = useState("");

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

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");

            const persianHour = hours.toString();
            setCurrentTime(`${persianHour}:${minutes}`);

            if (hours >= 5 && hours < 12) setGreeting("صبح بخیر");
            else if (hours >= 12 && hours < 17) setGreeting("ظهر بخیر");
            else if (hours >= 17 && hours < 21) setGreeting("عصر بخیر");
            else setGreeting("شب بخیر");
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingRing}>
                        <div className={styles.loadingRingInner} />
                    </div>
                    <span className={styles.loadingText}>در حال بارگذاری...</span>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            {/* ─── Animated Background ─── */}
            <div className={styles.bgMesh} />
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.bgOrb3} />

            <div className={styles.particlesContainer}>
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.particle}
                        style={{
                            left: `${15 + i * 15}%`,
                            animationDelay: `${i * 0.8}s`,
                            animationDuration: `${6 + i * 1.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* ─── Header ─── */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logoIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#logoGrad)" />
                                <defs>
                                    <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="21">
                                        <stop offset="0%" stopColor="#e8568f" />
                                        <stop offset="100%" stopColor="#c2185b" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className={styles.logo}>فیت‌بانو</span>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.timeDisplay}>
                        <div className={styles.timeDot} />
                        <span>{currentTime}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        خروج
                    </button>
                </div>
            </header>

            {/* ─── Welcome Section ─── */}
            <section className={styles.welcome}>
                <div className={styles.welcomeInner}>
                    <div className={styles.greetingRow}>
                        <span className={styles.greetingBadge}>
                            <span className={styles.greetingDot} />
                            داشبورد شخصی
                        </span>
                    </div>
                    <p className={styles.welcomeSubtitle}>
                        برنامه‌های اختصاصی تو آماده‌ست
                    </p>
                </div>
            </section>

            {/* ─── Cards Grid ─── */}
            <div className={styles.cardsGrid}>
                {/* ──── DIET CARD ──── */}
                <button
                    className={`${styles.card} ${styles.cardDiet}`}
                    onClick={() => router.push("/dashboard/diet")}
                >
                    <div className={styles.cardShine} />

                    <div className={styles.cardBg}>
                        <div className={styles.cardOrb} />
                        <div className={styles.cardOrbTwo} />
                        <div className={styles.cardPattern}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={styles.patternCircle} style={{
                                    top: `${20 + i * 20}%`,
                                    right: `${-10 + i * 5}%`,
                                    width: `${60 + i * 20}px`,
                                    height: `${60 + i * 20}px`,
                                    animationDelay: `${i * 0.3}s`
                                }} />
                            ))}
                        </div>
                    </div>

                    <div className={styles.cardContent}>
                        <div className={styles.cardTopRow}>
                            <div className={`${styles.cardIcon} ${styles.cardIconDiet}`}>
                                <span className={styles.cardEmoji}>🥗</span>
                                <div className={styles.iconRing} />
                                <div className={`${styles.iconGlow} ${styles.iconGlowGreen}`} />
                            </div>
                            <div className={styles.cardBadgeArea}>
                                <span className={`${styles.cardBadge} ${styles.cardBadgeDiet}`}>
                                    <span className={styles.badgeDot} />
                                    فعال
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardTitleRow}>
                                <h2 className={styles.cardTitle}>برنامه غذایی</h2>
                                <div className={`${styles.cardTitleLine} ${styles.cardTitleLineGreen}`} />
                            </div>
                            <p className={styles.cardDesc}>
                                وعده‌های روزانه متناسب با کالری هدف و نیاز بدنت
                            </p>

                            <div className={`${styles.cardStats} ${styles.cardStatsDiet}`}>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۳</span>
                                        <span className={styles.statLabel}>وعده</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۱۸۰۰</span>
                                        <span className={styles.statLabel}>کالری</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۷</span>
                                        <span className={styles.statLabel}>روز</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.cardAction} ${styles.cardActionDiet}`}>
                            <div className={styles.actionContent}>
                                <span className={styles.actionText}>مشاهده برنامه</span>
                                <span className={styles.actionSubtext}>کلیک کن</span>
                            </div>
                            <div className={`${styles.actionArrow} ${styles.actionArrowGreen}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </button>

                {/* ──── WORKOUT CARD ──── */}
                <button
                    className={`${styles.card} ${styles.cardWorkout}`}
                    onClick={() => router.push("/dashboard/workout")}
                >
                    <div className={styles.cardShine} />

                    <div className={styles.cardBg}>
                        <div className={`${styles.cardOrb} ${styles.cardOrbPink}`} />
                        <div className={`${styles.cardOrbTwo} ${styles.cardOrbTwoPink}`} />
                        <div className={styles.cardPattern}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`${styles.patternCircle} ${styles.patternCirclePink}`} style={{
                                    top: `${20 + i * 20}%`,
                                    right: `${-10 + i * 5}%`,
                                    width: `${60 + i * 20}px`,
                                    height: `${60 + i * 20}px`,
                                    animationDelay: `${i * 0.3}s`
                                }} />
                            ))}
                        </div>
                    </div>

                    <div className={styles.cardContent}>
                        <div className={styles.cardTopRow}>
                            <div className={`${styles.cardIcon} ${styles.cardIconWorkout}`}>
                                <span className={styles.cardEmoji}>💪</span>
                                <div className={`${styles.iconRing} ${styles.iconRingPink}`} />
                                <div className={`${styles.iconGlow} ${styles.iconGlowPink}`} />
                            </div>
                            <div className={styles.cardBadgeArea}>
                                <span className={`${styles.cardBadge} ${styles.cardBadgeWorkout}`}>
                                    <span className={styles.badgeDot} />
                                    فعال
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardTitleRow}>
                                <h2 className={styles.cardTitle}>برنامه ورزشی</h2>
                                <div className={`${styles.cardTitleLine} ${styles.cardTitleLinePink}`} />
                            </div>
                            <p className={styles.cardDesc}>
                                تمرینات هفتگی با گیف آموزشی و جزئیات کامل هر حرکت
                            </p>

                            <div className={`${styles.cardStats} ${styles.cardStatsWorkout}`}>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconPink}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۴</span>
                                        <span className={styles.statLabel}>روز</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconPink}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۲۴</span>
                                        <span className={styles.statLabel}>تمرین</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconPink}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>۴۵</span>
                                        <span className={styles.statLabel}>دقیقه</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.cardAction} ${styles.cardActionWorkout}`}>
                            <div className={styles.actionContent}>
                                <span className={styles.actionText}>مشاهده برنامه</span>
                                <span className={styles.actionSubtext}>کلیک کن</span>
                            </div>
                            <div className={`${styles.actionArrow} ${styles.actionArrowPink}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </main>
    );
}