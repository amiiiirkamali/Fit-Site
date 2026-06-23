"use client";

import { useEffect, useRef, useState } from "react";
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

function toPersianDateStr(date: Date): string {
    const d = new Date(date);
    const monthIdx = (d.getMonth() + 9) % 12;
    return `${d.getDate()} ${PERSIAN_MONTHS[monthIdx]}`;
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
    const [selectedDay, setSelectedDay] = useState(1);
    const tabsRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.workoutPlan) setPlan(data.workoutPlan);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;
        const btn = el.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement;
        btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [selectedDay]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [selectedDay]);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}>
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner} />
                        <Dumbbell size={24} className={styles.spinnerIcon} />
                    </div>
                    <p className={styles.loadingText}>در حال بارگذاری...</p>
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
                        برای ساخت برنامه ورزشی به داشبورد مراجعه کنید
                    </p>
                    <button className={styles.emptyBtn} onClick={() => router.push("/dashboard")}>
                        <ArrowRight size={16} />
                        بازگشت به داشبورد
                    </button>
                </div>
            </main>
        );
    }

    const metadata = parseWorkoutMetadata(plan.weeklySplit);
    const startDate = new Date(plan.createdAt);
    // Fixed mapping: day 1 = Saturday (schedule index 0), no offset
    const totalDays = 30;
    const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
    const dayExercises = plan.items.filter((item) => item.day === selectedDay);
    const cardioExercises = dayExercises.filter((e) => e.exerciseItem.muscleGroup === "کاردیو");
    const strengthExercises = dayExercises.filter((e) => e.exerciseItem.muscleGroup !== "کاردیو");
    const hasWorkout = dayExercises.length > 0;

    const dayOfWeek = (selectedDay - 1) % 7;
    const isWorkoutDay = metadata.schedule[dayOfWeek];
    // Always show rest if schedule says rest, even if old data has exercises on that day
    const isRestDay = !isWorkoutDay;

    const totalStrengthSets = strengthExercises.reduce((s, e) => s + e.sets, 0);
    const totalCardioSets = cardioExercises.reduce((s, e) => s + e.sets, 0);

    // Workout day indices from schedule
    const workoutDayIndices = metadata.schedule
        .map((isW, idx) => (isW ? idx : -1))
        .filter((idx) => idx >= 0);

    // Stats
    const workoutDaysInPlan = dayNumbers.filter((d) => {
        const dw = (d - 1) % 7;
        return metadata.schedule[dw] && plan.items.some((i) => i.day === d);
    }).length;
    const totalStrengthItems = plan.items.filter((i) => i.exerciseItem.muscleGroup !== "کاردیو").length;
    const totalCardioItems = plan.items.filter((i) => i.exerciseItem.muscleGroup === "کاردیو").length;

    return (
        <main className={styles.page}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />
            <div className={styles.bgGlow3} />

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
                            <Dumbbell size={14} />
                            <span>۴ هفته برنامه</span>
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

                    <div className={styles.heroWave}>
                        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
                        </svg>
                    </div>
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
                        <span>
                            {toPersianNum(workoutDaysInPlan)} روز تمرین
                        </span>
                    </div>
                    <div className={styles.contextDivider} />
                    <div className={styles.contextItem}>
                        <Target size={14} />
                        <span>
                            {toPersianNum(totalStrengthItems)} حرکت قدرتی
                        </span>
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
                                const isWorkoutDay = metadata.schedule[dw];
                                const hasEx = plan.items.some((item) => item.day === day);
                                return (
                                    <button
                                        key={day}
                                        data-day={day}
                                        className={`${styles.dayTab} ${selectedDay === day ? styles.dayTabActive : ""} ${(!hasEx || !isWorkoutDay) ? styles.dayTabRest : ""}`}
                                        onClick={() => setSelectedDay(day)}
                                    >
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
                                        {!isWorkoutDay && (
                                            <span className={styles.dayTabRestBadge}>استراحت</span>
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

                {/* ─── Day Status ─── */}
                <section className={styles.statusSection}>
                    <div className={styles.statusCard}>
                        <div className={styles.statusLeft}>
                            <span className={styles.statusLabel}>
                                {isRestDay ? <Moon size={14} /> : <Flame size={14} />}
                                {isRestDay
                                    ? `روز ${toPersianNum(selectedDay)} — استراحت`
                                    : `روز ${toPersianNum(selectedDay)} — ${PERSIAN_WEEKDAYS[dayOfWeek]}`
                                }
                            </span>
                            {!isRestDay && cardioExercises.length > 0 && (
                                <span className={styles.statusSub}>
                                    <Heart size={12} />
                                    {cardioExercises.length} حرکت هوازی
                                </span>
                            )}
                        </div>
                        {!isRestDay && hasWorkout && (
                            <div className={styles.statusRight}>
                                {totalCardioSets > 0 && (
                                    <span className={styles.statusMeta}>
                                        {toPersianNum(totalCardioSets)} ست هوازی
                                    </span>
                                )}
                                {totalStrengthSets > 0 && (
                                    <span className={styles.statusMeta}>
                                        {toPersianNum(totalStrengthSets)} ست قدرتی
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* ─── Cardio / Warm-up ─── */}
                {cardioExercises.length > 0 && (
                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionBlockHeader}>
                            <div className={styles.sectionBlockIcon}>
                                <Heart size={16} />
                            </div>
                            <div>
                                <h2 className={styles.sectionBlockTitle}>گرم‌کردن و هوازی</h2>
                                <span className={styles.sectionBlockSub}>قبل از تمرین اصلی انجام بده</span>
                            </div>
                        </div>
                        <div className={styles.exercisesGrid}>
                            {cardioExercises.map((item, idx) => (
                                <div key={idx} className={`${styles.exerciseCard} ${styles.exerciseCardCardio}`}>
                                    <div className={styles.exerciseNum}>
                                        <span>{idx + 1}</span>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── Strength Exercises ─── */}
                {!isRestDay && strengthExercises.length > 0 && (
                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionBlockHeader}>
                            <div className={styles.sectionBlockIcon}>
                                <Dumbbell size={16} />
                            </div>
                            <div>
                                <h2 className={styles.sectionBlockTitle}>تمرینات قدرتی</h2>
                                <span className={styles.sectionBlockSub}>
                                    {metadata.splitLabels[workoutDayIndices.indexOf(dayOfWeek) % metadata.splitLabels.length] || "فول‌بادی"}
                                </span>
                            </div>
                        </div>
                        <div className={styles.exercisesGrid}>
                            {strengthExercises.map((item, idx) => (
                                <div key={idx} className={styles.exerciseCard}>
                                    <div className={styles.exerciseNum}>
                                        <span>{idx + 1}</span>
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
                                                <span className={styles.srValue}>{item.sets}</span>
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
                                    </div>
                                </div>
                            ))}
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

                <div ref={endRef} />
            </div>
        </main>
    );
}