"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import ProfilePanel from "@/components/ProfilePanel";
import PlansDropdown from "@/components/PlansDropdown";
import styles from "./page.module.css";

interface UserData {
    phone: string;
    hasPaid: boolean;
    name?: string | null;
    gender?: string | null;
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    targetWeight?: number | null;
    goal?: string | null;
    activityLevel?: string | null;
}

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface DietPlanItem {
    mealSlot: string;
    day: number;
    foodItem: FoodItem;
}

interface DietPlan {
    id: string;
    dailyCalorieTarget: number;
    items: DietPlanItem[];
}

interface ExerciseItem {
    id: string;
    name: string;
    gifUrl?: string | null;
}

interface WorkoutPlanItem {
    day: number;
    exerciseItem: ExerciseItem;
}

interface WorkoutPlan {
    id: string;
    weeklySplit: string;
    items: WorkoutPlanItem[];
}

interface PlanData {
    dietPlan: DietPlan | null;
    workoutPlan: WorkoutPlan | null;
}

interface ProgramInfo {
    id: string;
    programNumber: number;
    createdAt: string;
    dietPlan: { id: string; dailyCalorieTarget: number } | null;
    workoutPlan: { id: string; weeklySplit: string } | null;
}

function parseWorkoutMetadata(raw: string) {
    const parts = raw.split(" | ");
    const labels: string[] = [];
    let location = "home";
    let duration = "30";
    let schedule: boolean[] = [];

    for (const p of parts) {
        if (p.startsWith("location:")) location = p.replace("location:", "");
        else if (p.startsWith("duration:")) duration = p.replace("duration:", "");
        else if (p.startsWith("schedule:"))
            schedule = p
                .replace("schedule:", "")
                .split("")
                .map((c) => c === "1");
        else labels.push(p);
    }

    const workoutDayNames = schedule.map((v, i) =>
        v
            ? ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"][
                  i
              ]
            : ""
    ).filter(Boolean);

    return { splitLabels: labels, location, duration, schedule, workoutDayNames };
}

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState("");
    const [greeting, setGreeting] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [plans, setPlans] = useState<PlanData | null>(null);
    const [programs, setPrograms] = useState<ProgramInfo[]>([]);
    const [activeProgram, setActiveProgram] = useState(1);
    const [currentProgram, setCurrentProgram] = useState<number | null>(null);

    const fetchPrograms = useCallback(async (token: string) => {
        const res = await fetch("/api/programs", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.programs.length > 0) {
            setPrograms(data.programs);
            const progParam = searchParams?.get("program") ?? null;
            let target: number;
            if (progParam) {
                target = parseInt(progParam);
                if (!data.programs.some((p: ProgramInfo) => p.programNumber === target)) {
                    target = data.programs[data.programs.length - 1].programNumber;
                }
            } else {
                target = data.programs[data.programs.length - 1].programNumber;
            }
            setCurrentProgram(target);
            setActiveProgram(target);
        }
    }, [searchParams]);

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
                    if (data.quizAnswers) setQuizAnswers(data.quizAnswers);
                } else {
                    router.push("/");
                }
                setLoading(false);
            })
            .catch(() => {
                router.push("/login");
                setLoading(false);
            });

        fetchPrograms(token);
    }, [router, fetchPrograms]);

    useEffect(() => {
        if (currentProgram === null) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`/api/plan/my-plans?program=${currentProgram}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.dietPlan || data.workoutPlan) {
                    setPlans(data);
                }
            })
            .catch(() => {});
    }, [currentProgram]);

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

    const handleSaveProfile = async (data: Partial<UserData>) => {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/auth/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            setUser((prev) => (prev ? { ...prev, ...result.user } : prev));
        }
    };

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

    const dietPlan = plans?.dietPlan;
    const workoutPlan = plans?.workoutPlan;

    const mealsPerDay = dietPlan
        ? new Set(dietPlan.items.filter((m) => m.day === 1).map((m) => m.mealSlot)).size
        : 3;

    const totalDays = 30;

    const dailyCalories = dietPlan?.dailyCalorieTarget ?? 1800;

    const workoutMetadata = workoutPlan
        ? parseWorkoutMetadata(workoutPlan.weeklySplit)
        : null;

    const workoutDaysPerWeek = workoutMetadata
        ? workoutMetadata.schedule.filter(Boolean).length
        : 4;

    const totalWorkoutDays = workoutPlan
        ? new Set(workoutPlan.items.map((m) => m.day)).size
        : Math.round(30 / Math.max(workoutDaysPerWeek, 1));

    const totalExercises = workoutPlan
        ? new Set(workoutPlan.items.map((m) => m.exerciseItem.id)).size
        : 24;

    const workoutDuration = workoutMetadata?.duration ?? "45";

    const cardioMinutes: Record<string, number> = { "15": 3, "30": 5, "45": 8, "60+": 10 };
    const cardioTime = cardioMinutes[workoutDuration] ?? 5;

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
                    <PlansDropdown />
                    <button className={styles.profileBtn} onClick={() => setProfileOpen(true)}>
                        <User size={16} />
                        <span className={styles.btnLabel}>پروفایل</span>
                    </button>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className={styles.btnLabel}>خروج</span>
                    </button>
                </div>
            </header>

            {/* ─── Welcome Section ─── */}
            <section className={styles.welcome}>
                <div className={styles.welcomeInner}>
                    <div className={styles.greetingRow}>
                        <span className={styles.greetingBadge}>
                            <span className={styles.greetingDot} />
                            برنامه {toPersianNum(activeProgram)}
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
                    onClick={() => router.push(`/dashboard/diet?program=${activeProgram}`)}
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
                                <h2 className={styles.cardTitle}>رژیم غذایی</h2>
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
                                        <span className={styles.statValue}>{toPersianNum(mealsPerDay)}</span>
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
                                        <span className={styles.statValue}>{toPersianNum(dailyCalories)}</span>
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
                                        <span className={styles.statValue}>{toPersianNum(totalDays)}</span>
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
                    onClick={() => router.push(`/dashboard/workout?program=${activeProgram}`)}
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
                                <h2 className={styles.cardTitle}>تمرینات</h2>
                                <div className={`${styles.cardTitleLine} ${styles.cardTitleLinePink}`} />
                            </div>
                            <p className={styles.cardDesc}>
                                تمرینات هفتگی با گیف آموزشی و جزئیات کامل هر حرکت
                            </p>

                            <div className={`${styles.cardStats} ${styles.cardStatsWorkout}`}>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconPink}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>{toPersianNum(totalExercises)}</span>
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
                                        <span className={styles.statValue}>{toPersianNum(cardioTime)}</span>
                                        <span className={styles.statLabel}>دقیقه هوازی</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIconWrap} ${styles.statIconPink}`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className={styles.statText}>
                                        <span className={styles.statValue}>{toPersianNum(totalWorkoutDays)}</span>
                                        <span className={styles.statLabel}>روز</span>
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

            <ProfilePanel
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                phone={user?.phone ?? ""}
                profile={{
                    name: user?.name ?? null,
                    gender: user?.gender ?? null,
                    age: user?.age ?? null,
                    height: user?.height ?? null,
                    weight: user?.weight ?? null,
                    targetWeight: user?.targetWeight ?? null,
                    goal: user?.goal ?? null,
                    activityLevel: user?.activityLevel ?? null,
                }}
                quizAnswers={quizAnswers}
                onSave={handleSaveProfile}
            />
        </main>
    );
}
