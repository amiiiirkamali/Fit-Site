"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Flame,
    ChefHat,
    ChevronLeft,
    ChevronRight,
    Wheat,
    Banana,
    Droplets,
    Salad,
    Calendar,
    Sun,
    Moon,
    Apple,
    Check,
    CircleCheck,
    Trophy,
    TrendingUp,
    Sparkles,
    Utensils,
    Target,
    Zap,
    Heart,
    Star,
    Activity,
} from "lucide-react";
import styles from "./page.module.css";

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
}

interface MealItem {
    mealSlot: string;
    day: number;
    foodItem: FoodItem;
}

interface DietPlan {
    id: string;
    dailyCalorieTarget: number;
    createdAt: string;
    items: MealItem[];
}

interface ConsumedState {
    [key: string]: boolean;
}

const mealSlotNames: Record<
    string,
    { label: string; icon: React.ReactNode; gradient: string }
> = {
    breakfast: {
        label: "صبحانه",
        icon: <Sun size={16} />,
        gradient: "linear-gradient(135deg, #34d399, #10b981)",
    },
    lunch: {
        label: "ناهار",
        icon: <Utensils size={16} />,
        gradient: "linear-gradient(135deg, #10b981, #059669)",
    },
    dinner: {
        label: "شام",
        icon: <Moon size={16} />,
        gradient: "linear-gradient(135deg, #059669, #10b981)",
    },
    snack: {
        label: "میان‌وعده",
        icon: <Apple size={16} />,
        gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
};

const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

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
    return `${jd} ${persianMonths[jm - 1]}`;
}

function toPersianDay(date: Date): string {
    const weekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const d = new Date(date);
    return weekdays[d.getDay() === 6 ? 0 : d.getDay() + 1];
}

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

export default function DietPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [consumed, setConsumed] = useState<ConsumedState>({});
    const [animatingCard, setAnimatingCard] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const tabsRef = useRef<HTMLDivElement>(null);

    const storageKey = plan ? `diet-consumed-${plan.id}` : null;

    // Load consumed state from localStorage
    useEffect(() => {
        if (!storageKey) return;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setConsumed(JSON.parse(saved));
            } catch {}
        }
    }, [storageKey]);

    // Save consumed state to localStorage
    const saveConsumed = useCallback((newState: ConsumedState) => {
        setConsumed(newState);
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newState));
        }
    }, [storageKey]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchPlan = async (): Promise<DietPlan | null> => {
            const res = await fetch("/api/plan/my-plans", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            return data.dietPlan || null;
        };

        const generateMissing = async (): Promise<void> => {
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
        };

        (async () => {
            try {
                let p = await fetchPlan();
                if (!p) {
                    setGenerating(true);
                    await generateMissing();
                    p = await fetchPlan();
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
        const btn = el.querySelector(
            `[data-day="${selectedDay}"]`
        ) as HTMLElement;
        btn?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [selectedDay]);

    const getConsumedKey = (day: number, slot: string) => `${day}-${slot}`;

    const toggleConsumed = (day: number, slot: string) => {
        const key = getConsumedKey(day, slot);
        const newState = { ...consumed, [key]: !consumed[key] };
        saveConsumed(newState);

        setAnimatingCard(key);
        setTimeout(() => setAnimatingCard(null), 600);

        // Check if all meals for the day are consumed
        if (!consumed[key]) {
            const dayMeals = plan?.items.filter((m) => m.day === day) || [];
            const allConsumed = dayMeals.every((m) => {
                const mKey = getConsumedKey(day, m.mealSlot);
                return mKey === key ? true : newState[mKey];
            });
            if (allConsumed && dayMeals.length > 0) {
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
                        <Salad size={24} className={styles.spinnerIcon} />
                    </div>
                    <p className={styles.loadingText}>
                        {generating ? "در حال ساخت برنامه غذایی اختصاصی تو..." : "در حال بارگذاری..."}
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
                        <ChefHat size={48} className={styles.emptyIcon} />
                    </div>
                    <p className={styles.emptyText}>برنامه غذایی هنوز ساخته نشده</p>
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
                                    const checkRes = await fetch("/api/plan/my-plans", {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const checkData = await checkRes.json();

                                    const promises: Promise<Response>[] = [];
                                    if (!checkData.dietPlan) {
                                        promises.push(
                                            fetch("/api/plan/generate-diet", {
                                                method: "POST",
                                                headers: { Authorization: `Bearer ${token}` },
                                            })
                                        );
                                    }
                                    if (!checkData.workoutPlan) {
                                        promises.push(
                                            fetch("/api/plan/generate-workout", {
                                                method: "POST",
                                                headers: { Authorization: `Bearer ${token}` },
                                            })
                                        );
                                    }
                                    await Promise.all(promises);

                                    const planRes = await fetch("/api/plan/my-plans", {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const planData = await planRes.json();
                                    if (planData.dietPlan) setPlan(planData.dietPlan);
                                } catch {
                                    alert("خطا در ارتباط با سرور");
                                } finally {
                                    setLoading(false);
                                    setGenerating(false);
                                }
                            }}
                        >
                            <ChefHat size={16} />
                            ساخت برنامه غذایی
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

    const startDate = new Date(plan.createdAt);
    startDate.setDate(startDate.getDate() + 1);
    const totalDays = 30;
    const dayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);
    const dayMeals = plan.items.filter((m) => m.day === selectedDay);

    const totalCal = dayMeals.reduce((s, m) => s + m.foodItem.calories, 0);
    const consumedCal = dayMeals
        .filter((m) => consumed[getConsumedKey(selectedDay, m.mealSlot)])
        .reduce((s, m) => s + m.foodItem.calories, 0);
    const calPercent = Math.min(
        100,
        Math.round((consumedCal / plan.dailyCalorieTarget) * 100)
    );

    const totalProtein = dayMeals.reduce((s, m) => s + m.foodItem.protein, 0);
    const totalCarbs = dayMeals.reduce((s, m) => s + m.foodItem.carbs, 0);
    const totalFat = dayMeals.reduce((s, m) => s + m.foodItem.fat, 0);

    const consumedProtein = dayMeals
        .filter((m) => consumed[getConsumedKey(selectedDay, m.mealSlot)])
        .reduce((s, m) => s + m.foodItem.protein, 0);
    const consumedCarbs = dayMeals
        .filter((m) => consumed[getConsumedKey(selectedDay, m.mealSlot)])
        .reduce((s, m) => s + m.foodItem.carbs, 0);
    const consumedFat = dayMeals
        .filter((m) => consumed[getConsumedKey(selectedDay, m.mealSlot)])
        .reduce((s, m) => s + m.foodItem.fat, 0);

    const consumedCount = dayMeals.filter(
        (m) => consumed[getConsumedKey(selectedDay, m.mealSlot)]
    ).length;
    const mealProgress = dayMeals.length
        ? Math.round((consumedCount / dayMeals.length) * 100)
        : 0;

    // Overall 30-day progress
    const totalMeals = plan.items.length;
    const totalConsumed = plan.items.filter(
        (m) => consumed[getConsumedKey(m.day, m.mealSlot)]
    ).length;
    const overallProgress = totalMeals
        ? Math.round((totalConsumed / totalMeals) * 100)
        : 0;

    // Streak calculation
    let streak = 0;
    for (let d = 1; d <= totalDays; d++) {
        const dMeals = plan.items.filter((m) => m.day === d);
        if (dMeals.length === 0) continue;
        const allDone = dMeals.every(
            (m) => consumed[getConsumedKey(d, m.mealSlot)]
        );
        if (allDone) streak++;
        else break;
    }

    const getDayCompletion = (day: number) => {
        const dMeals = plan.items.filter((m) => m.day === day);
        if (dMeals.length === 0) return 0;
        const doneCount = dMeals.filter(
            (m) => consumed[getConsumedKey(day, m.mealSlot)]
        ).length;
        return Math.round((doneCount / dMeals.length) * 100);
    };

    return (
        <main className={styles.page}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />
            <div className={styles.bgGlow3} />

            {/* Confetti */}
            {showConfetti && (
                <div className={styles.confettiContainer}>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className={styles.confetti}
                            style={
                                {
                                    "--x": `${Math.random() * 100}vw`,
                                    "--delay": `${Math.random() * 0.5}s`,
                                    "--color": [
                                        "#10b981",
                                        "#059669",
                                        "#34d399",
                                        "#10b981",
                                        "#d1fae5",
                                        "#059669",
                                    ][Math.floor(Math.random() * 6)],
                                    "--rotate": `${Math.random() * 360}deg`,
                                    "--duration": `${1.5 + Math.random() * 1.5}s`,
                                } as React.CSSProperties
                            }
                        />
                    ))}
                    <div className={styles.confettiMessage}>
                        <Trophy size={32} />
                        <span>آفرین! همه وعده‌ها رو مصرف کردی! 🎉</span>
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
                            <Zap size={14} />
                            <span>{toPersianNum(streak)} روز متوالی</span>
                        </div>
                    </div>

                    <div className={styles.heroBody}>
                        <div className={styles.heroIcon}>
                            <Salad size={32} />
                        </div>
                        <h1 className={styles.heroTitle}>برنامه غذایی ۳۰ روزه</h1>
                        <p className={styles.heroDesc}>
                            اختصاصی برای تو — هر روز یه وعده‌ی جدید
                        </p>

                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <div className={styles.heroStatIcon}>
                                    <Flame size={18} />
                                </div>
                                <div className={styles.heroStatInfo}>
                  <span className={styles.heroStatValue}>
                    {toPersianNum(plan.dailyCalorieTarget)}
                  </span>
                                    <span className={styles.heroStatLabel}>کالری روزانه</span>
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
                                    <Trophy size={18} />
                                </div>
                                <div className={styles.heroStatInfo}>
                  <span className={styles.heroStatValue}>
                    {toPersianNum(totalConsumed)}
                  </span>
                                    <span className={styles.heroStatLabel}>وعده مصرف‌شده</span>
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
                        <span>
              {toPersianNum(totalConsumed)} از {toPersianNum(totalMeals)} وعده
            </span>
                    </div>
                </div>

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
                                const completion = getDayCompletion(day);
                                return (
                                    <button
                                        key={day}
                                        data-day={day}
                                        className={`${styles.dayTab} ${selectedDay === day ? styles.dayTabActive : ""} ${completion === 100 ? styles.dayTabDone : ""}`}
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
                                        {completion > 0 && (
                                            <div className={styles.dayTabProgress}>
                                                <div
                                                    className={styles.dayTabProgressFill}
                                                    style={{ width: `${completion}%` }}
                                                />
                                            </div>
                                        )}
                                        {completion === 100 && (
                                            <div className={styles.dayTabCheck}>
                                                <Check size={10} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            className={styles.tabsArrow}
                            onClick={() => {
                                if (selectedDay < totalDays)
                                    setSelectedDay(selectedDay + 1);
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                </section>

                {/* ─── Progress Cards ─── */}
                <section className={styles.progressSection}>
                    {/* Overall Day Card */}
                    <div className={styles.overallCard}>
                        <div className={styles.overallTop}>
                            <div className={styles.overallTitle}>
                                <Flame size={18} />
                                <span>روز {toPersianNum(selectedDay)} — کالری</span>
                            </div>
                            <div className={styles.overallBadge}>
                                {consumedCal >= plan.dailyCalorieTarget ? (
                                    <>
                                        <Trophy size={14} />
                                        <span>هدف محقق شد</span>
                                    </>
                                ) : (
                                    <>
                                        <Activity size={14} />
                                        <span>{toPersianNum(calPercent)}٪</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.overallTrack}>
                            <div
                                className={styles.overallFill}
                                style={{ width: `${Math.min(100, calPercent)}%` }}
                            />
                        </div>
                        <div className={styles.overallMeta}>
                            <span>{toPersianNum(consumedCal)} از {toPersianNum(plan.dailyCalorieTarget)} کیلوکالری مصرف شد</span>
                        </div>
                    </div>

                    <div className={styles.progressGrid}>
                        {/* Calorie Progress */}
                        <div className={styles.progressCard}>
                            <div className={styles.progressCardHeader}>
                                <div className={styles.progressCardIcon}>
                                    <Flame size={18} />
                                </div>
                                <div>
                                    <h3 className={styles.progressCardTitle}>کالری مصرفی</h3>
                                    <p className={styles.progressCardSub}>
                                        روز {toPersianNum(selectedDay)}
                                    </p>
                                </div>
                                <span className={styles.progressPercent}>
                  {toPersianNum(calPercent)}٪
                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${calPercent}%` }}
                                />
                            </div>
                            <div className={styles.progressMeta}>
                <span>
                  {toPersianNum(consumedCal)} از{" "}
                    {toPersianNum(plan.dailyCalorieTarget)} کیلوکالری
                </span>
                                <span>
                  باقی‌مانده:{" "}
                                    {toPersianNum(
                                        Math.max(0, plan.dailyCalorieTarget - consumedCal)
                                    )}
                </span>
                            </div>
                        </div>

                        {/* Meal Progress */}
                        <div className={styles.progressCard}>
                            <div className={styles.progressCardHeader}>
                                <div className={styles.progressCardIcon}>
                                    <Target size={18} />
                                </div>
                                <div>
                                    <h3 className={styles.progressCardTitle}>
                                        وعده‌های مصرف‌شده
                                    </h3>
                                    <p className={styles.progressCardSub}>
                                        {toPersianNum(consumedCount)} از{" "}
                                        {toPersianNum(dayMeals.length)} وعده
                                    </p>
                                </div>
                                <span
                                    className={styles.progressPercent}
                                >
                  {toPersianNum(mealProgress)}٪
                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${mealProgress}%` }}
                                />
                            </div>
                            <div className={styles.progressMeta}>
                <span>
                  {consumedCount === dayMeals.length && dayMeals.length > 0
                      ? "🎉 عالی! همه وعده‌ها مصرف شد"
                      : `${toPersianNum(dayMeals.length - consumedCount)} وعده باقی‌مانده`}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Macro Summary */}
                    <div className={styles.macroSummary}>
                        <div className={styles.macroSummaryItem}>
                            <div className={`${styles.macroSummaryIcon} ${styles.macroProtein}`}>
                                <Wheat size={16} />
                            </div>
                            <div className={styles.macroSummaryInfo}>
                <span className={styles.macroSummaryValue}>
                  {toPersianNum(consumedProtein)}/{toPersianNum(totalProtein)}g
                </span>
                                <span className={styles.macroSummaryLabel}>پروتئین</span>
                            </div>
                            <div className={`${styles.macroSummaryBar} ${styles.barProtein}`}>
                                <div
                                    className={`${styles.macroSummaryBarFill} ${styles.fillProtein}`}
                                    style={{
                                        width: `${totalProtein ? Math.min(100, (consumedProtein / totalProtein) * 100) : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.macroSummaryItem}>
                            <div className={`${styles.macroSummaryIcon} ${styles.macroCarbs}`}>
                                <Banana size={16} />
                            </div>
                            <div className={styles.macroSummaryInfo}>
                <span className={styles.macroSummaryValue}>
                  {toPersianNum(consumedCarbs)}/{toPersianNum(totalCarbs)}g
                </span>
                                <span className={styles.macroSummaryLabel}>کربوهیدرات</span>
                            </div>
                            <div className={`${styles.macroSummaryBar} ${styles.barCarbs}`}>
                                <div
                                    className={`${styles.macroSummaryBarFill} ${styles.fillCarbs}`}
                                    style={{
                                        width: `${totalCarbs ? Math.min(100, (consumedCarbs / totalCarbs) * 100) : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.macroSummaryItem}>
                            <div className={`${styles.macroSummaryIcon} ${styles.macroFat}`}>
                                <Droplets size={16} />
                            </div>
                            <div className={styles.macroSummaryInfo}>
                <span className={styles.macroSummaryValue}>
                  {toPersianNum(consumedFat)}/{toPersianNum(totalFat)}g
                </span>
                                <span className={styles.macroSummaryLabel}>چربی</span>
                            </div>
                            <div className={`${styles.macroSummaryBar} ${styles.barFat}`}>
                                <div
                                    className={`${styles.macroSummaryBarFill} ${styles.fillFat}`}
                                    style={{
                                        width: `${totalFat ? Math.min(100, (consumedFat / totalFat) * 100) : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Meals ─── */}
                <section className={styles.mealsSection}>
                    <div className={styles.mealsHeader}>
                        <div className={styles.mealsHeaderRight}>
                            <h2 className={styles.mealsTitle}>وعده‌های امروز</h2>
                            <span className={styles.mealsCount}>
                {toPersianNum(dayMeals.length)} وعده
              </span>
                        </div>
                        {consumedCount > 0 && (
                            <div className={styles.mealsHeaderBadge}>
                                <Heart size={12} />
                                <span>
                  {toPersianNum(consumedCount)} مصرف شده
                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.mealsGrid}>
                        {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                            (slot) => {
                                const meal = dayMeals.find((m) => m.mealSlot === slot);
                                if (!meal) return null;
                                const slotInfo = mealSlotNames[slot];
                                const isConsumed =
                                    consumed[getConsumedKey(selectedDay, slot)];
                                const isAnimating =
                                    animatingCard === getConsumedKey(selectedDay, slot);

                                return (
                                    <div
                                        key={slot}
                                        className={`${styles.mealCard} ${isConsumed ? styles.mealCardConsumed : ""} ${isAnimating ? styles.mealCardAnimating : ""}`}
                                    >
                                        <div
                                            className={styles.mealAccent}
                                            style={{ background: slotInfo.gradient }}
                                        />
                                        <div className={styles.mealBody}>
                                            <div className={styles.mealTop}>
                                                <div className={styles.mealSlotRow}>
                          <span className={styles.mealSlotIcon}>
                            {slotInfo.icon}
                          </span>
                                                    <span className={styles.mealSlotName}>
                            {slotInfo.label}
                          </span>
                                                </div>
                                            </div>

                                            <div className={styles.mealNameRow}>
                                                <h3 className={styles.mealName}>
                                                    {meal.foodItem.name}
                                                </h3>
                                                <div className={styles.mealCalBadge}>
                                                    <Flame size={12} />
                                                    <span>
                            {toPersianNum(meal.foodItem.calories)}
                          </span>
                                                    <span className={styles.mealCalUnit}>kcal</span>
                                                </div>
                                            </div>

                                            {meal.foodItem.description && (
                                                <p className={styles.mealDesc}>
                                                    {meal.foodItem.description}
                                                </p>
                                            )}

                                            <div className={styles.mealMacros}>
                                                <div className={styles.mealMacro}>
                                                    <Wheat size={11} />
                                                    <span>{meal.foodItem.protein}g</span>
                                                    <span className={styles.mealMacroLabel}>
                            پروتئین
                          </span>
                                                </div>
                                                <div className={styles.mealMacro}>
                                                    <Banana size={11} />
                                                    <span>{meal.foodItem.carbs}g</span>
                                                    <span className={styles.mealMacroLabel}>
                            کربوهیدرات
                          </span>
                                                </div>
                                                <div className={styles.mealMacro}>
                                                    <Droplets size={11} />
                                                    <span>{meal.foodItem.fat}g</span>
                                                    <span className={styles.mealMacroLabel}>
                            چربی
                          </span>
                                                </div>
                                            </div>

                                            {/* ─── Consume Toggle ─── */}
                                            <button
                                                className={`${styles.consumeBtn} ${isConsumed ? styles.consumeBtnActive : ""}`}
                                                onClick={() => toggleConsumed(selectedDay, slot)}
                                            >
                                                <div className={styles.consumeBtnTrack}>
                                                    <div className={styles.consumeBtnFill} />
                                                </div>
                                                <div className={styles.consumeBtnContent}>
                                                    <div className={styles.consumeBtnIcon}>
                                                        {isConsumed ? (
                                                            <CircleCheck size={18} />
                                                        ) : (
                                                            <div className={styles.consumeBtnCircle} />
                                                        )}
                                                    </div>
                                                    <span className={styles.consumeBtnText}>
                            {isConsumed
                                ? "مصرف شده ✓"
                                : "مصرف کردم"}
                          </span>
                                                    {isConsumed && (
                                                        <Star
                                                            size={14}
                                                            className={styles.consumeBtnStar}
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                        {isConsumed && (
                                            <div className={styles.completedBadge}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>

                    {dayMeals.length === 0 && (
                        <div className={styles.noMeals}>
                            <ChefHat size={40} />
                            <p>وعده‌ای برای این روز ثبت نشده</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}