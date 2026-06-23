"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Dumbbell,
    ChevronLeft,
    ChevronRight,
    Zap,
    Timer,
    Target,
    Flame,
    Play,
    Home,
    Building2,
    Heart,
    Clock,
    CalendarDays,
    Moon,
    Sun,
    TrendingUp,
    Sparkles,
    Trophy,
    Calendar,
    Check,
    CircleCheck,
    Activity,
    Star,
    Award,
} from "lucide-react";
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
    createdAt: string;
    items: WorkoutItem[];
}

interface CompletedState {
    [key: string]: boolean;
}

type WorkoutLocation = "home" | "gym" | "mixed";

const PERSIAN_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const PERSIAN_MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

function parseWorkoutMetadata(weeklySplit: string): {
    splitLabels: string[];
    location: WorkoutLocation;
    duration: string;
    schedule: boolean[];
    workoutDayNames: string[];
} {
    const parts = weeklySplit.split(" | ");
    const splitLabels = parts.filter(
        (p) =>
            !p.startsWith("location:") &&
            !p.startsWith("duration:") &&
            !p.startsWith("schedule:")
    );
    const locationPart = parts.find((p) => p.startsWith("location:"));
    const durationPart = parts.find((p) => p.startsWith("duration:"));
    const schedulePart = parts.find((p) => p.startsWith("schedule:"));

    const location = (locationPart?.replace("location:", "") || "home") as WorkoutLocation;
    const duration = durationPart?.replace("duration:", "") || "30";
    const schedule = (schedulePart?.replace("schedule:", "") || "1010100")
        .split("")
        .map((c) => c === "1");

    const workoutDayNames = PERSIAN_WEEKDAYS.filter((_, i) => schedule[i]);

    return { splitLabels, location, duration, schedule, workoutDayNames };
}

function div(a: number, b: number) {
    return Math.floor(a / b);
}

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
        365 * gy +
        div(gy2 + 3, 4) -
        div(gy2 + 99, 100) +
        div(gy2 + 399, 400) -
        80 +
        gd +
        g_d_m[gm - 1];
    jy += 33 * div(days, 12053);
    days %= 12053;
    jy += 4 * div(days, 1461);
    days %= 1461;
    if (days > 365) {
        jy += div(days - 1, 365);
        days = (days - 1) % 365;
    }
    let jm: number, jd: number;
    if (days < 186) {
        jm = 1 + div(days, 31);
        jd = 1 + (days % 31);
    } else {
        jm = 7 + div(days - 186, 30);
        jd = 1 + ((days - 186) % 30);
    }
    return [jy, jm, jd];
}

function toPersianDateStr(date: Date): string {
    const d = new Date(date);
    const [, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jd} ${PERSIAN_MONTHS[jm - 1]}`;
}

function toPersianDay(date: Date): string {
    const weekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const d = new Date(date);
    return weekdays[d.getDay() === 6 ? 0 : d.getDay() + 1];
}

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

export default function WorkoutPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [completed, setCompleted] = useState<CompletedState>({});
    const [animatingCard, setAnimatingCard] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const tabsRef = useRef<HTMLDivElement>(null);

    const storageKey = plan ? `workout-completed-${plan.id}` : null;

    // Load completed state from localStorage
    useEffect(() => {
        if (!storageKey) return;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setCompleted(JSON.parse(saved));
            } catch {}
        }
    }, [storageKey]);

    const saveCompleted = useCallback((newState: CompletedState) => {
        setCompleted(newState);
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newState));
        }
    }, [storageKey]);

    const getCompletedKey = (day: number, exerciseId: string, idx: number) =>
        `${day}-${exerciseId}-${idx}`;

    async function fetchPlan(token: string): Promise<WorkoutPlan | null> {
        const res = await fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        return data.workoutPlan || null;
    }

    async function generateMissing(token: string): Promise<void> {
        const res = await fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const promises: Promise<Response>[] = [];

        if (!data.dietPlan) {
            promises.push(
                fetch("/api/plan/generate-diet", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                })
            );
        }

        if (!data.workoutPlan) {
            promises.push(
                fetch("/api/plan/generate-workout", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                })
            );
        }

        await Promise.all(promises);
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        (async () => {
            try {
                let p = await fetchPlan(token);
                if (!p) {
                    setGenerating(true);
                    await generateMissing(token);
                    p = await fetchPlan(token);
                    if (p) setPlan(p);
                } else {
                    setPlan(p);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
                setGenerating(false);
            }
        })();
    }, [router]);

    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;
        const btn = el.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement;
        btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [selectedDay]);

    const toggleCompleted = (day: number, exerciseId: string, idx: number, allExIds: string[], isCardio: boolean) => {
        const key = getCompletedKey(day, exerciseId, idx);
        const newCompleted = !completed[key];
        const newState = { ...completed, [key]: newCompleted };
        saveCompleted(newState);

        setAnimatingCard(key);
        setTimeout(() => setAnimatingCard(null), 600);

        if (isCardio) {
            const token = localStorage.getItem("token");
            if (token) {
                fetch("/api/cardio/log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ exerciseId, day, completed: newCompleted }),
                }).catch(() => {});
            }
        }

        // Check if all exercises for the day are done
        if (!completed[key]) {
            const allDone = allExIds.every((id, i) => {
                const k = getCompletedKey(day, id, i);
                return k === key ? true : newState[k];
            });
            if (allDone && allExIds.length > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2500);
            }
        }
    };

    if (loading || generating) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner} />
                        <Dumbbell size={24} className={styles.spinnerIcon} />
                    </div>
                    <p className={styles.loadingText}>
                        {generating ? "در حال ساخت برنامه ورزشی اختصاصی تو..." : "در حال بارگذاری..."}
                    </p>
                    {generating && (
                        <p className={styles.loadingSubText}>
                            این فرایند ممکن است چند ثانیه طول بکشد
                        </p>
                    )}
                </div>
            </main>
        );
    }

    if (!plan) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>
                    <div className={styles.emptyIconWrap}>
                        <Dumbbell size={48} className={styles.emptyIcon} />
                    </div>
                    <p className={styles.emptyText}>برنامه ورزشی هنوز ساخته نشده</p>
                    <p className={styles.emptySubText}>
                        برای ساخت برنامه روی دکمه زیر کلیک کن
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                        <button
                            className={styles.emptyBtn}
                            onClick={async () => {
                                const token = localStorage.getItem("token");
                                if (!token) return;
                                setLoading(true);
                                setGenerating(true);
                                try {
                                    await generateMissing(token);
                                    const p = await fetchPlan(token);
                                    if (p) setPlan(p);
                                } catch {
                                    alert("خطا در ارتباط با سرور");
                                } finally {
                                    setLoading(false);
                                    setGenerating(false);
                                }
                            }}
                        >
                            <Dumbbell size={16} />
                            ساخت برنامه ورزشی
                        </button>
                        <button
                            className={styles.emptyBtn}
                            style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowRight size={16} />
                            داشبورد
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const metadata = parseWorkoutMetadata(plan.weeklySplit);
    const startDate = new Date(plan.createdAt);
    startDate.setDate(startDate.getDate() + 1);
    const totalDays = 30;
    const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
    const dayExercises = plan.items.filter((item) => item.day === selectedDay);
    const cardioExercises = dayExercises.filter((e) => e.exerciseItem.muscleGroup === "کاردیو");
    const strengthExercises = dayExercises.filter((e) => e.exerciseItem.muscleGroup !== "کاردیو");
    const hasWorkout = dayExercises.length > 0;

    const dayOfWeek = (selectedDay - 1) % 7;
    const isWorkoutDay = metadata.schedule[dayOfWeek];
    const isRestDay = !isWorkoutDay;

    const totalStrengthSets = strengthExercises.reduce((s, e) => s + e.sets, 0);
    const totalCardioSets = cardioExercises.reduce((s, e) => s + e.sets, 0);

    const workoutDayIndices = metadata.schedule
        .map((isW, idx) => (isW ? idx : -1))
        .filter((idx) => idx >= 0);

    // ─── Progress calculations ───
    const cardioIds = cardioExercises.map((e) => e.exerciseItem.id);
    const strengthIds = strengthExercises.map((e) => e.exerciseItem.id);
    const allDayExIds = [...cardioIds, ...strengthIds];

    const completedCardio = cardioExercises.filter((e, i) =>
        completed[getCompletedKey(selectedDay, e.exerciseItem.id, i)]
    ).length;
    const completedStrength = strengthExercises.filter((e, i) =>
        completed[getCompletedKey(selectedDay, e.exerciseItem.id, i + cardioExercises.length)]
    ).length;

    const cardioProgress = cardioExercises.length
        ? Math.round((completedCardio / cardioExercises.length) * 100)
        : 0;
    const strengthProgress = strengthExercises.length
        ? Math.round((completedStrength / strengthExercises.length) * 100)
        : 0;
    const overallDayProgress = dayExercises.length
        ? Math.round(((completedCardio + completedStrength) / dayExercises.length) * 100)
        : 0;

    // ─── Stats ───
    const workoutDaysInPlan = dayNumbers.filter((d) => {
        const dw = (d - 1) % 7;
        return metadata.schedule[dw] && plan.items.some((i) => i.day === d);
    }).length;
    const totalStrengthItems = plan.items.filter((i) => i.exerciseItem.muscleGroup !== "کاردیو").length;

    // Helper to check if an item is completed using the correct local index logic (Cardio first, then Strength)
    const isItemCompleted = (day: number, item: WorkoutItem) => {
        const dayItems = plan.items.filter((x) => x.day === day);
        const cardio = dayItems.filter((e) => e.exerciseItem.muscleGroup === "کاردیو");
        const strength = dayItems.filter((e) => e.exerciseItem.muscleGroup !== "کاردیو");

        let isCardio = item.exerciseItem.muscleGroup === "کاردیو";
        if (isCardio) {
            const idx = cardio.findIndex(x => x === item);
            return completed[getCompletedKey(day, item.exerciseItem.id, idx)];
        } else {
            const idx = strength.findIndex(x => x === item);
            return completed[getCompletedKey(day, item.exerciseItem.id, idx + cardio.length)];
        }
    };

    // Overall progress
    const totalExercises = plan.items.length;
    const totalCompleted = plan.items.filter(item => isItemCompleted(item.day, item)).length;
    const overallProgress = totalExercises ? Math.round((totalCompleted / totalExercises) * 100) : 0;

    // Streak: consecutive completed workout days from day 1
    let streak = 0;
    for (let d = 1; d <= totalDays; d++) {
        const dw = (d - 1) % 7;
        if (!metadata.schedule[dw]) continue; // skip rest days
        const dItems = plan.items.filter((i) => i.day === d);
        if (dItems.length === 0) break;
        const allDone = dItems.every((it) => isItemCompleted(d, it));
        if (allDone) streak++;
        else break;
    }

    const getDayCompletion = (day: number) => {
        const dItems = plan.items.filter((i) => i.day === day);
        if (dItems.length === 0) return 0;
        const doneCount = dItems.filter((it) => isItemCompleted(day, it)).length;
        return Math.round((doneCount / dItems.length) * 100);
    };

    return (
        <main className={styles.page}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />
            <div className={styles.bgGlow3} />

            {/* Confetti */}
            {showConfetti && (
                <div className={styles.confettiContainer}>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className={styles.confetti}
                            style={
                                {
                                    "--x": `${Math.random() * 100}vw`,
                                    "--delay": `${Math.random() * 0.5}s`,
                                    "--color": [
                                        "#c2185b", "#9d1249", "#e8568f",
                                        "#c2185b", "#fdeaf1", "#c2185b",
                                    ][Math.floor(Math.random() * 6)],
                                    "--rotate": `${Math.random() * 360}deg`,
                                    "--duration": `${1.5 + Math.random() * 1.5}s`,
                                } as React.CSSProperties
                            }
                        />
                    ))}
                    <div className={styles.confettiMessage}>
                        <Trophy size={32} />
                        <span>عالی! تمرین امروز رو کامل کردی! 🔥</span>
                    </div>
                </div>
            )}

            {/* ─── Hero Header ─── */}
            <header className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={styles.heroParticles}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={styles.heroParticle}
                            style={
                                {
                                    "--px": `${10 + Math.random() * 80}%`,
                                    "--py": `${10 + Math.random() * 80}%`,
                                    "--pd": `${3 + Math.random() * 4}s`,
                                    "--ps": `${4 + Math.random() * 8}px`,
                                } as React.CSSProperties
                            }
                        />
                    ))}
                </div>
                <div className={styles.heroContent}>
                    <div className={styles.heroTop}>
                        <button
                            className={styles.backBtn}
                            onClick={() => router.push("/dashboard")}
                        >
                            <ChevronRight size={18} />
                            <span>داشبورد</span>
                        </button>
                        <div className={styles.heroStreak}>
                            <Flame size={14} />
                            <span>{toPersianNum(streak)} روز متوالی</span>
                        </div>
                    </div>

                    <div className={styles.heroBody}>
                        <div className={styles.heroIcon}>
                            <Dumbbell size={32} />
                        </div>
                        <h1 className={styles.heroTitle}>برنامه ورزشی ۳۰ روزه</h1>
                        <p className={styles.heroDesc}>
                            تمرینات شخصی‌سازی شده با توجه به اهداف و تجهیزات تو
                        </p>

                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <div className={styles.heroStatIcon}>
                                    <CalendarDays size={18} />
                                </div>
                                <div className={styles.heroStatInfo}>
                                    <span className={styles.heroStatValue}>
                                        {toPersianNum(metadata.workoutDayNames.length)}
                                    </span>
                                    <span className={styles.heroStatLabel}>روز در هفته</span>
                                </div>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <div className={styles.heroStatIcon}>
                                    <Clock size={18} />
                                </div>
                                <div className={styles.heroStatInfo}>
                                    <span className={styles.heroStatValue}>
                                        {metadata.duration === "15" ? "۱۵" :
                                            metadata.duration === "30" ? "۳۰" :
                                                metadata.duration === "45" ? "۴۵" : "۶۰+"}
                                    </span>
                                    <span className={styles.heroStatLabel}>دقیقه</span>
                                </div>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <div className={styles.heroStatIcon}>
                                    <TrendingUp size={18} />
                                </div>
                                <div className={styles.heroStatInfo}>
                                    <span className={styles.heroStatValue}>
                                        {toPersianNum(overallProgress)}٪
                                    </span>
                                    <span className={styles.heroStatLabel}>پیشرفت کل</span>
                                </div>
                            </div>
                            <div className={styles.heroStatDivider} />
                            <div className={styles.heroStat}>
                                <div className={styles.heroStatIcon}>
                                    {metadata.location === "home" ? <Home size={18} /> : <Building2 size={18} />}
                                </div>
                                <div className={styles.heroStatInfo}>
                                    <span className={styles.heroStatValue}>
                                        {metadata.location === "home" ? "خانه" : "باشگاه"}
                                    </span>
                                    <span className={styles.heroStatLabel}>محل تمرین</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className={styles.heroWave}>
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
                    </svg>
                </div>
            </header>

            {/* ─── Content ─── */}
            <div className={styles.content}>
                {/* ─── Context Bar ─── */}
                <div className={styles.contextBar}>
                    <div className={styles.contextItem}>
                        <Calendar size={14} />
                        <span>از {toPersianDateStr(startDate)}</span>
                    </div>
                    <div className={styles.contextDivider} />
                    <div className={styles.contextItem}>
                        <span>۳۰ روز</span>
                    </div>
                    <div className={styles.contextDivider} />
                    <div className={styles.contextItem}>
                        <Sparkles size={14} />
                        <span>{toPersianNum(workoutDaysInPlan)} روز تمرین</span>
                    </div>
                    <div className={styles.contextDivider} />
                    <div className={styles.contextItem}>
                        <Award size={14} />
                        <span>{toPersianNum(totalCompleted)} از {toPersianNum(totalExercises)} حرکت</span>
                    </div>
                </div>

                {/* ─── Weekly Schedule ─── */}
                <section className={styles.weeklySection}>
                    <div className={styles.weeklyGrid}>
                        {PERSIAN_WEEKDAYS.map((name, idx) => {
                            const isWorkoutDay = metadata.schedule[idx];
                            return (
                                <div
                                    key={idx}
                                    className={`${styles.weekdayCard} ${isWorkoutDay ? styles.weekdayActive : styles.weekdayRest}`}
                                >
                                    <span className={styles.weekdayName}>{name}</span>
                                    <span className={styles.weekdayIcon}>
                                        {isWorkoutDay ? <Dumbbell size={14} /> : <Moon size={14} />}
                                    </span>
                                    <span className={styles.weekdayStatus}>
                                        {isWorkoutDay ? "تمرین" : "استراحت"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ─── Split Info ─── */}
                <section className={styles.splitSection}>
                    <div className={styles.splitCard}>
                        <div className={styles.splitTop}>
                            <div className={styles.splitIconWrap}>
                                <Dumbbell size={16} />
                            </div>
                            <span className={styles.splitLabel}>تقسیم‌بندی هفتگی</span>
                        </div>
                        <div className={styles.splitChips}>
                            {metadata.splitLabels.map((label, i) => (
                                <span key={i} className={styles.splitChip}>{label}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Day Tabs ─── */}
                <section className={styles.tabsSection}>
                    <div className={styles.tabsWrapper}>
                        <button
                            className={styles.tabsArrow}
                            onClick={() => {
                                if (selectedDay > 1) setSelectedDay(selectedDay - 1);
                            }}
                        >
                            <ChevronRight size={18} />
                        </button>
                        <div className={styles.tabsScroll} ref={tabsRef}>
                            {dayNumbers.map((day) => {
                                const date = new Date(startDate);
                                date.setDate(date.getDate() + day - 1);
                                const dw = (day - 1) % 7;
                                const isWD = metadata.schedule[dw];
                                const hasEx = plan.items.some((item) => item.day === day);
                                const completion = getDayCompletion(day);
                                return (
                                    <button
                                        key={day}
                                        data-day={day}
                                        className={`${styles.dayTab} ${selectedDay === day ? styles.dayTabActive : ""} ${(!hasEx || !isWD) ? styles.dayTabRest : ""} ${completion === 100 ? styles.dayTabDone : ""}`}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        {isWD && hasEx && completion === 100 && (
                                            <div className={styles.dayTabCheck}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                        <span className={styles.dayTabWeek}>
                                            هفته {toPersianNum(Math.ceil(day / 7))}
                                        </span>
                                        <span className={styles.dayTabNum}>
                                            {toPersianNum(day)}
                                        </span>
                                        <span className={styles.dayTabDate}>
                                            {toPersianDateStr(date)}
                                        </span>
                                        <span className={styles.dayTabDay}>
                                            {toPersianDay(date)}
                                        </span>
                                        {!isWD && (
                                            <span className={styles.dayTabRestBadge}>استراحت</span>
                                        )}
                                        {isWD && (
                                            <div className={styles.dayTabProgress}>
                                                <div
                                                    className={styles.dayTabProgressFill}
                                                    style={{ width: `${completion}%` }}
                                                />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            className={styles.tabsArrow}
                            onClick={() => {
                                if (selectedDay < totalDays) setSelectedDay(selectedDay + 1);
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                </section>

                {/* ─── Day Header & Progress ─── */}
                {!isRestDay && hasWorkout && (
                    <section className={styles.progressSection}>
                        {/* Overall Day Card */}
                        <div className={styles.overallCard}>
                            <div className={styles.overallTop}>
                                <div className={styles.overallTitle}>
                                    <Flame size={18} />
                                    <span>روز {toPersianNum(selectedDay)} — {PERSIAN_WEEKDAYS[dayOfWeek]}</span>
                                </div>
                                <div className={styles.overallBadge}>
                                    {overallDayProgress === 100 ? (
                                        <>
                                            <Trophy size={14} />
                                            <span>تکمیل شد</span>
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={14} />
                                            <span>{toPersianNum(overallDayProgress)}٪</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.overallTrack}>
                                <div
                                    className={styles.overallFill}
                                    style={{ width: `${overallDayProgress}%` }}
                                />
                            </div>
                            <div className={styles.overallMeta}>
                                <span>{toPersianNum(completedCardio + completedStrength)} از {toPersianNum(dayExercises.length)} حرکت انجام شد</span>
                            </div>
                        </div>

                        {/* Cardio + Strength Progress Cards */}
                        <div className={styles.progressGrid}>
                            {cardioExercises.length > 0 && (
                                <div className={`${styles.progressCard} ${styles.progressCardCardio}`}>
                                    <div className={styles.progressCardHeader}>
                                        <div className={`${styles.progressCardIcon} ${styles.iconCardio}`}>
                                            <Heart size={18} />
                                        </div>
                                        <div className={styles.progressCardInfo}>
                                            <h3 className={styles.progressCardTitle}>هوازی</h3>
                                            <p className={styles.progressCardSub}>
                                                {toPersianNum(completedCardio)} از {toPersianNum(cardioExercises.length)} حرکت
                                            </p>
                                        </div>
                                        <span className={`${styles.progressPercent} ${styles.percentCardio}`}>
                                            {toPersianNum(cardioProgress)}٪
                                        </span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div
                                            className={`${styles.progressFill} ${styles.fillCardio}`}
                                            style={{ width: `${cardioProgress}%` }}
                                        />
                                    </div>
                                    <div className={styles.progressMeta}>
                                        <span><Timer size={11} /> {toPersianNum(totalCardioSets)} ست</span>
                                        <span>
                                            {cardioProgress === 100 ? "🎉 تمام شد" : `${toPersianNum(cardioExercises.length - completedCardio)} باقی‌مانده`}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {strengthExercises.length > 0 && (
                                <div className={`${styles.progressCard} ${styles.progressCardStrength}`}>
                                    <div className={styles.progressCardHeader}>
                                        <div className={`${styles.progressCardIcon} ${styles.iconStrength}`}>
                                            <Dumbbell size={18} />
                                        </div>
                                        <div className={styles.progressCardInfo}>
                                            <h3 className={styles.progressCardTitle}>قدرتی</h3>
                                            <p className={styles.progressCardSub}>
                                                {toPersianNum(completedStrength)} از {toPersianNum(strengthExercises.length)} حرکت
                                            </p>
                                        </div>
                                        <span className={`${styles.progressPercent} ${styles.percentStrength}`}>
                                            {toPersianNum(strengthProgress)}٪
                                        </span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div
                                            className={`${styles.progressFill} ${styles.fillStrength}`}
                                            style={{ width: `${strengthProgress}%` }}
                                        />
                                    </div>
                                    <div className={styles.progressMeta}>
                                        <span><Target size={11} /> {toPersianNum(totalStrengthSets)} ست</span>
                                        <span>
                                            {strengthProgress === 100 ? "🎉 تمام شد" : `${toPersianNum(strengthExercises.length - completedStrength)} باقی‌مانده`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ─── Cardio / Warm-up ─── */}
                {cardioExercises.length > 0 && (
                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionBlockHeader}>
                            <div className={`${styles.sectionBlockIcon} ${styles.iconCardio}`}>
                                <Heart size={16} />
                            </div>
                            <div>
                                <h2 className={styles.sectionBlockTitle}>گرم‌کردن و هوازی</h2>
                                <span className={styles.sectionBlockSub}>قبل از تمرین اصلی انجام بده</span>
                            </div>
                            <div className={styles.sectionBlockCount}>
                                {toPersianNum(completedCardio)}/{toPersianNum(cardioExercises.length)}
                            </div>
                        </div>
                        <div className={styles.exercisesGrid}>
                            {cardioExercises.map((item, idx) => {
                                const key = getCompletedKey(selectedDay, item.exerciseItem.id, idx);
                                const isDone = completed[key];
                                const isAnim = animatingCard === key;
                                return (
                                    <div
                                        key={key}
                                        className={`${styles.exerciseCard} ${styles.exerciseCardCardio} ${isDone ? styles.exerciseCardDone : ""} ${isAnim ? styles.exerciseCardAnimating : ""}`}
                                    >
                                        <div className={`${styles.exerciseNum} ${styles.exerciseNumCardio}`}>
                                            <span>{toPersianNum(idx + 1)}</span>
                                        </div>
                                        <div className={styles.exerciseBody}>
                                            <div className={styles.exerciseTop}>
                                                <h3 className={styles.exerciseName}>{item.exerciseItem.name}</h3>
                                                <div className={styles.exerciseMeta}>
                                                    <span className={styles.metaTag}>
                                                        <Timer size={10} />
                                                        {item.reps}
                                                    </span>
                                                    <span className={styles.metaTag}>
                                                        <Zap size={10} />
                                                        {item.exerciseItem.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.exerciseItem.description && (
                                                <p className={styles.exerciseDesc}>{item.exerciseItem.description}</p>
                                            )}
                                            {item.exerciseItem.gifUrl && (
                                                <div className={styles.gifWrap}>
                                                    <img
                                                        src={item.exerciseItem.gifUrl}
                                                        alt={item.exerciseItem.name}
                                                        className={styles.gif}
                                                        loading="lazy"
                                                    />
                                                    <div className={styles.gifOverlay}>
                                                        <Play size={16} />
                                                        مشاهده حرکت
                                                    </div>
                                                </div>
                                            )}

                                            {/* Complete Button */}
                                            <button
                                                className={`${styles.completeBtn} ${styles.completeBtnCardio} ${isDone ? styles.completeBtnActive : ""}`}
                                                onClick={() => toggleCompleted(selectedDay, item.exerciseItem.id, idx, allDayExIds, true)}
                                            >
                                                <div className={styles.completeBtnContent}>
                                                    <div className={styles.completeBtnIcon}>
                                                        {isDone ? <CircleCheck size={18} /> : <div className={styles.completeBtnCircle} />}
                                                    </div>
                                                    <span className={styles.completeBtnText}>
                                                        {isDone ? "انجام شد ✓" : "انجام دادم"}
                                                    </span>
                                                    {isDone && <Star size={14} className={styles.completeBtnStar} />}
                                                </div>
                                            </button>
                                        </div>
                                        {isDone && (
                                            <div className={styles.completedBadge}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ─── Strength Exercises ─── */}
                {!isRestDay && strengthExercises.length > 0 && (
                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionBlockHeader}>
                            <div className={`${styles.sectionBlockIcon} ${styles.iconStrength}`}>
                                <Dumbbell size={16} />
                            </div>
                            <div>
                                <h2 className={styles.sectionBlockTitle}>تمرینات قدرتی</h2>
                                <span className={styles.sectionBlockSub}>
                                    {metadata.splitLabels[workoutDayIndices.indexOf(dayOfWeek) % metadata.splitLabels.length] || "فول‌بادی"}
                                </span>
                            </div>
                            <div className={styles.sectionBlockCount}>
                                {toPersianNum(completedStrength)}/{toPersianNum(strengthExercises.length)}
                            </div>
                        </div>
                        <div className={styles.exercisesGrid}>
                            {strengthExercises.map((item, idx) => {
                                const globalIdx = idx + cardioExercises.length;
                                const key = getCompletedKey(selectedDay, item.exerciseItem.id, globalIdx);
                                const isDone = completed[key];
                                const isAnim = animatingCard === key;
                                return (
                                    <div
                                        key={key}
                                        className={`${styles.exerciseCard} ${isDone ? styles.exerciseCardDone : ""} ${isAnim ? styles.exerciseCardAnimating : ""}`}
                                    >
                                        <div className={styles.exerciseNum}>
                                            <span>{toPersianNum(idx + 1)}</span>
                                        </div>
                                        <div className={styles.exerciseBody}>
                                            <div className={styles.exerciseTop}>
                                                <h3 className={styles.exerciseName}>{item.exerciseItem.name}</h3>
                                                <div className={styles.exerciseMeta}>
                                                    <span className={styles.metaTag}>
                                                        <Target size={10} />
                                                        {item.exerciseItem.muscleGroup}
                                                    </span>
                                                    <span className={styles.metaTag}>
                                                        <Zap size={10} />
                                                        {item.exerciseItem.difficulty}
                                                    </span>
                                                    <span className={styles.metaTag}>
                                                        {item.exerciseItem.equipment}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.exerciseItem.description && (
                                                <p className={styles.exerciseDesc}>{item.exerciseItem.description}</p>
                                            )}
                                            <div className={styles.setsReps}>
                                                <div className={styles.srItem}>
                                                    <span className={styles.srValue}>{toPersianNum(item.sets)}</span>
                                                    <span className={styles.srLabel}>ست</span>
                                                </div>
                                                <div className={styles.srDivider} />
                                                <div className={styles.srItem}>
                                                    <span className={styles.srValue}>{item.reps}</span>
                                                    <span className={styles.srLabel}>تکرار</span>
                                                </div>
                                            </div>
                                            {item.exerciseItem.gifUrl && (
                                                <div className={styles.gifWrap}>
                                                    <img
                                                        src={item.exerciseItem.gifUrl}
                                                        alt={item.exerciseItem.name}
                                                        className={styles.gif}
                                                        loading="lazy"
                                                    />
                                                    <div className={styles.gifOverlay}>
                                                        <Play size={16} />
                                                        مشاهده حرکت
                                                    </div>
                                                </div>
                                            )}

                                            {/* Complete Button */}
                                            <button
                                                className={`${styles.completeBtn} ${isDone ? styles.completeBtnActive : ""}`}
                                                onClick={() => toggleCompleted(selectedDay, item.exerciseItem.id, globalIdx, allDayExIds, false)}
                                            >
                                                <div className={styles.completeBtnContent}>
                                                    <div className={styles.completeBtnIcon}>
                                                        {isDone ? <CircleCheck size={18} /> : <div className={styles.completeBtnCircle} />}
                                                    </div>
                                                    <span className={styles.completeBtnText}>
                                                        {isDone ? "انجام شد ✓" : "انجام دادم"}
                                                    </span>
                                                    {isDone && <Star size={14} className={styles.completeBtnStar} />}
                                                </div>
                                            </button>
                                        </div>
                                        {isDone && (
                                            <div className={styles.completedBadge}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ─── Rest Day ─── */}
                {isRestDay && (
                    <section className={styles.restSection}>
                        <div className={styles.restCard}>
                            <div className={styles.restIcon}>
                                <Moon size={32} />
                            </div>
                            <h2 className={styles.restTitle}>روز استراحت</h2>
                            <p className={styles.restDesc}>
                                امروز وقت استراحت و ریکاوری است. بدنت برای رشد به استراحت نیاز دارد.
                            </p>
                            <div className={styles.restTips}>
                                <div className={styles.restTip}>
                                    <Sun size={14} />
                                    <span>قدم زدن سبک</span>
                                </div>
                                <div className={styles.restTip}>
                                    <Heart size={14} />
                                    <span>حرکات کششی</span>
                                </div>
                                <div className={styles.restTip}>
                                    <Dumbbell size={14} />
                                    <span>فیزیوتراپی</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}