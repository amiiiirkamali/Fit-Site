"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import {
    ArrowLeft,
    Sparkles,
    Salad,
    Dumbbell,
    ShieldCheck,
    Clock3,
    CheckCircle2,
    Star,
    HeartPulse,
    Activity,
    Minus,
    Plus,
    Users,
} from "lucide-react";
import styles from "./page.module.css";

type Goal = "lose" | "maintain" | "gain";

const stats = [
    { value: "+۲۵۰هزار", label: "کاربر", icon: Users },
    { value: "۴.۹", label: "امتیاز کاربران", icon: Star },
    { value: "۱۰۰٪", label: "برنامه شخصی", icon: Sparkles },
    { value: "۲ دقیقه", label: "زمان شروع", icon: Clock3 },
];

const features = [
    {
        icon: Sparkles,
        title: "تحلیل هوشمند بدن و هدف",
        desc: "با چند سوال ساده، وضعیت بدنی، هدف و سبک زندگیت تحلیل میشه.",
    },
    {
        icon: Salad,
        title: "برنامه غذایی اختصاصی",
        desc: "وعده‌های روزانه با کالری هدف و ماکروهای قابل اجرا برای زندگی واقعی.",
    },
    {
        icon: Dumbbell,
        title: "برنامه ورزشی مناسب تو",
        desc: "تمرین‌های متناسب با سطح، تجهیزات و زمان واقعی که داری.",
    },
    {
        icon: ShieldCheck,
        title: "علمی و قابل اعتماد",
        desc: "محاسبات بر پایه فرمول‌های استاندارد و منطق برنامه‌ریزی حرفه‌ای.",
    },
    {
        icon: Activity,
        title: "منعطف با شرایط تو",
        desc: "خانه یا باشگاه، مبتدی یا حرفه‌ای — برنامه با شرایط تو ساخته میشه.",
    },
    {
        icon: HeartPulse,
        title: "طراحی شده برای خانم‌ها",
        desc: "همه چیز از زبان طراحی تا ساختار برنامه برای خانم‌ها بهینه شده.",
    },
];

const steps = [
    {
        no: "۱",
        title: "پرسش‌نامه هوشمند",
        desc: "۳۰ سوال ساده درباره هدف، سبک زندگی و ترجیحاتت.",
    },
    {
        no: "۲",
        title: "تحلیل و برنامه‌سازی",
        desc: "الگوریتم با فرمول‌های علمی، برنامه‌ی اختصاصی تو رو می‌سازه.",
    },
    {
        no: "۳",
        title: "دسترسی همیشگی",
        desc: "برنامه‌هات همیشه در پنل شخصی‌ات در دسترس هستن.",
    },
];

function calculateBMR(weight: number, height: number) {
    return 10 * weight + 6.25 * height - 5 * 30 - 161;
}

function calculateTDEE(bmr: number, goal: Goal) {
    const tdee = bmr * 1.375;
    if (goal === "lose") return Math.round(tdee - 400);
    if (goal === "gain") return Math.round(tdee + 350);
    return Math.round(tdee);
}

function useCountUp(target: number, duration = 2000) {
    const [value, setValue] = useState(0);
    const ref = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();
        function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round((target - 0) * eased));
            if (progress < 1) ref.current = requestAnimationFrame(tick);
        }
        ref.current = requestAnimationFrame(tick);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [target, duration]);

    return value;
}

function CalorieWidget() {
    const [weight, setWeight] = useState(65);
    const [height, setHeight] = useState(165);
    const [goal, setGoal] = useState<Goal>("lose");
    const bmr = calculateBMR(weight, height);
    const calories = calculateTDEE(bmr, goal);
    const displayCal = useCountUp(calories);

    return (
        <div className={styles.calWidget}>
            <div className={styles.calHeader}>
                <span className={styles.calLabel}>هدف کالری روزانه</span>
                <div className={styles.calValue}>
                    <span className={styles.calNum}>{displayCal}</span>
                    <span className={styles.calUnit}>kcal</span>
                </div>
            </div>
            <div className={styles.calControls}>
                <div className={styles.calRow}>
                    <div className={styles.calRowInner}>
                        <span className={styles.calRowLabel}>وزن</span>
                        <div className={styles.calStepper}>
                            <button onClick={() => setWeight(w => Math.max(30, w - 1))} className={styles.stepperBtn}><Minus size={14} /></button>
                            <span className={styles.stepperValue}>{weight} kg</span>
                            <button onClick={() => setWeight(w => Math.min(230, w + 1))} className={styles.stepperBtn}><Plus size={14} /></button>
                        </div>
                    </div>
                    <input type="range" min={30} max={230} value={weight} onChange={e => setWeight(Number(e.target.value))} className={styles.calSlider} />
                </div>
                <div className={styles.calRow}>
                    <div className={styles.calRowInner}>
                        <span className={styles.calRowLabel}>قد</span>
                        <div className={styles.calStepper}>
                            <button onClick={() => setHeight(h => Math.max(100, h - 1))} className={styles.stepperBtn}><Minus size={14} /></button>
                            <span className={styles.stepperValue}>{height} cm</span>
                            <button onClick={() => setHeight(h => Math.min(230, h + 1))} className={styles.stepperBtn}><Plus size={14} /></button>
                        </div>
                    </div>
                    <input type="range" min={100} max={230} value={height} onChange={e => setHeight(Number(e.target.value))} className={styles.calSlider} />
                </div>
                <div className={styles.goalRow}>
                    {(["lose", "maintain", "gain"] as Goal[]).map(g => (
                        <button key={g} className={`${styles.goalChip} ${goal === g ? styles.goalChipActive : ""}`} onClick={() => setGoal(g)}>
                            {g === "lose" ? "کاهش وزن" : g === "maintain" ? "حفظ" : "افزایش وزن"}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { if (data.user?.hasPaid) setIsLoggedIn(true); })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { if (isLoggedIn) router.replace("/dashboard"); }, [isLoggedIn, router]);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroGlowOne} />
                <div className={styles.heroGlowTwo} />
                <div className={styles.heroInner}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroBadge}>
                            <Sparkles size={14} />
                            برنامه‌ساز اختصاصی خانم‌ها
                        </div>
                        <h1 className={styles.title}>
                            برنامه‌ی غذایی و ورزشی
                            <br />
                            <span className={styles.titleAccent}>مخصوص بدن تو</span>
                        </h1>
                        <p className={styles.subtitle}>
                            با یک تجربه‌ی سریع، شیک و هوشمند، برنامه‌ای دریافت کن که متناسب
                            با هدف، شرایط بدنی و سبک زندگی‌ات طراحی شده.
                        </p>
                        <div className={styles.heroActions}>
                            <button className={styles.primaryBtn} onClick={() => router.push("/quiz")}>
                                ساخت برنامه
                                <ArrowLeft size={18} />
                            </button>
                            <a href="#features" className={styles.secondaryBtn}>
                                امکانات
                            </a>
                        </div>
                        <div className={styles.heroTrust}>
                            <div className={styles.trustItem}>
                                <CheckCircle2 size={16} />
                                <span>بدون نیاز به دانش تخصصی</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckCircle2 size={16} />
                                <span>ساخت سریع برنامه</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckCircle2 size={16} />
                                <span>مخصوص خانم‌ها</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={styles.calWidgetCenter}>
                            <CalorieWidget />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {stats.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className={styles.statCard}>
                                <div className={styles.statIcon}><Icon size={18} /></div>
                                <strong>{item.value}</strong>
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={styles.featuresSection} id="features">
                <div className={styles.featuresBgGlow} />
                <div className={styles.sectionHead}>
                    <span className={styles.sectionEyebrow}>امکانات اصلی</span>
                    <h2 className={styles.sectionTitle}>همه‌چیز برای یک شروع حرفه‌ای</h2>
                    <p className={styles.sectionDesc}>
                        از تحلیل هوشمند تا برنامه‌ی اختصاصی — هر چیزی که برای شروع نیاز داری.
                    </p>
                </div>
                <div className={styles.featuresGrid}>
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div key={idx} className={styles.featureCard}>
                                <div className={styles.featureIcon}><Icon size={20} /></div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className={styles.howSection}>
                <div className={styles.sectionHead}>
                    <span className={styles.sectionEyebrow}>مراحل کار</span>
                    <h2 className={styles.sectionTitle}>سه قدم ساده تا برنامه‌ی اختصاصی</h2>
                </div>
                <div className={styles.stepsGrid}>
                    {steps.map((step, idx) => (
                        <div key={idx} className={styles.stepCard}>
                            <div className={styles.stepNumWrap}>
                                <span className={styles.stepNo}>{step.no}</span>
                                {idx < steps.length - 1 && <div className={styles.stepLine} />}
                            </div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <TestimonialsCarousel />

            <section className={styles.finalCtaSection}>
                <div className={styles.finalCtaCard}>
                    <div className={styles.finalGlow} />
                    <span className={styles.finalTag}>آماده‌ای؟</span>
                    <h2>برنامه‌ی اختصاصی‌ات را بساز</h2>
                    <p>۳۰ سوال، یک برنامه‌ی کاملاً شخصی</p>
                    <button className={styles.finalBtn} onClick={() => router.push("/quiz")}>
                        شروع کن
                        <ArrowLeft size={18} />
                    </button>
                </div>
            </section>

            <Footer />
        </main>
    );
}
