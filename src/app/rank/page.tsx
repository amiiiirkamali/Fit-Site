"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Medal, Award, ArrowLeft, Heart, Zap, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

interface RankEntry {
    rank: number;
    userId: string;
    name: string;
    count: number;
}

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

const rankIcons = [Trophy, Medal, Award];

export default function RankPage() {
    const router = useRouter();
    const [data, setData] = useState<RankEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cardio/leaderboard")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) setData(res.leaderboard);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p>در حال بارگذاری...</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />

            <Header sticky={false} />

            {/* Hero */}
            <header className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={styles.heroContent}>
                    <div className={styles.heroBody}>
                        <div className={styles.heroIcon}>
                            <Trophy size={36} />
                        </div>
                        <h1 className={styles.heroTitle}>جدول رتبه‌بندی هوازی</h1>
                        <p className={styles.heroDesc}>
                            هر بار که یکی از تمرینات هوازی (گرم‌کردن) رو توی برنامه ورزشیت تیک میزنی، یه امتیاز برات ثبت میشه. 
                            هرچقدر بیشتر تمرین کنی، رتبه‌ات تو جدول بالاتر میاد. اینجا میتونی ببینی در مقایسه با بقیه کاربرا کجایی!
                        </p>
                    </div>
                </div>
                <div className={styles.heroWave}>
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
                    </svg>
                </div>
            </header>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.statsBar}>
                    <div className={styles.statItem}>
                        <Heart size={16} />
                        <span>بر اساس تعداد تمرینات هوازی انجام‌شده</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <Zap size={16} />
                        <span>{toPersianNum(data.length)} کاربر در رقابت</span>
                    </div>
                </div>

                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Award size={48} />
                        <h2>هنوز رتبه‌بندی تشکیل نشده</h2>
                        <p>با انجام تمرینات هوازی توی برنامه ورزشی، اسمت تو این جدول ثبت میشه</p>
                    </div>
                ) : (
                    <div className={styles.rankList}>
                        {data.map((entry) => {
                            const RankIcon = rankIcons[entry.rank - 1] || null;
                            return (
                                <div
                                    key={entry.userId}
                                    className={`${styles.rankCard} ${entry.rank <= 3 ? styles.rankCardTop : ""}`}
                                >
                                    <div className={styles.rankBadge}>
                                        {RankIcon ? (
                                            <RankIcon
                                                size={20}
                                                className={
                                                    entry.rank === 1
                                                        ? styles.rankGold
                                                        : entry.rank === 2
                                                        ? styles.rankSilver
                                                        : styles.rankBronze
                                                }
                                            />
                                        ) : (
                                            <span className={styles.rankNum}>
                                                {toPersianNum(entry.rank)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.rankInfo}>
                                        <span className={styles.rankName}>{entry.name}</span>
                                        <span className={styles.rankLabel}>
                                            {toPersianNum(entry.count)} تمرین هوازی
                                        </span>
                                    </div>
                                    <div className={styles.rankScore}>
                                        <span className={styles.rankScoreValue}>
                                            {toPersianNum(entry.count)}
                                        </span>
                                        <span className={styles.rankScoreLabel}>امتیاز</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />

        </main>
    );
}
