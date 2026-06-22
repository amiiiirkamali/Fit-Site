"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Salad, Dumbbell, LayoutDashboard, HelpCircle, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const steps = [
    {
        icon: Sparkles,
        title: "پرسش‌نامه هوشمند",
        desc: "با پاسخ به ۲۸ سوال ساده درباره هدف، سبک زندگی و ترجیحاتت، اطلاعات لازم رو در اختیار الگوریتم هوشمند ما قرار می‌دی.",
        highlight: "کمتر از ۳ دقیقه",
    },
    {
        icon: Salad,
        title: "برنامه غذایی اختصاصی",
        desc: "بر اساس اطلاعاتت، یه برنامه غذایی ۳۰ روزه با وعده‌های متنوع و متناسب با کالری هدف دریافت می‌کنی.",
        highlight: "شخصی‌سازی شده",
    },
    {
        icon: Dumbbell,
        title: "برنامه ورزشی هوشمند",
        desc: "تمرینات ۳۰ روزه با توجه به سطح تجربه، تجهیزات در دسترس و زمانت طراحی میشه. هر حرکت با گیف آموزشی همراهه.",
        highlight: "همراه با گیف",
    },
    {
        icon: LayoutDashboard,
        title: "داشبورد شخصی",
        desc: "همیشه و همه‌جا به برنامه‌هات دسترسی داری. می‌تونی پیشرفتت رو دنبال کنی و اطلاعات پروفایلت رو به‌روز کنی.",
        highlight: "دسترسی همیشگی",
    },
];

const faqs = [
    {
        q: "چطور می‌تونم شروع کنم؟",
        a: "کافیه روی دکمه «ساخت برنامه» بزنی و به سوالات ساده پرسش‌نامه پاسخ بدی. بعد از تأیید شماره موبایل، برنامه اختصاصی تو ساخته میشه.",
    },
    {
        q: "برنامه غذایی چند روزه؟",
        a: "برنامه غذایی برای ۳۰ روز طراحی شده و شامل وعده‌های صبحانه، ناهار، شام و میان‌وعده با کالری هدف شخصی توئه.",
    },
    {
        q: "آیا به تجهیزات خاصی نیاز دارم؟",
        a: "نه! برنامه ورزشی بر اساس تجهیزاتی که داری طراحی میشه. چه خونه باشی چه باشگاه، برنامه مخصوص خودت رو می‌گیری.",
    },
    {
        q: "چطور به برنامه‌ها دسترسی دارم؟",
        a: "بعد از خرید اشتراک، می‌تونی از طریق داشبورد شخصی در هر لحظه به برنامه‌هات دسترسی داشته باشی.",
    },
];

function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={`${styles.fadeUp} ${inView ? styles.fadeUpVisible : ""}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function Accordion({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`${styles.accordion} ${open ? styles.accordionOpen : ""}`}>
            <button className={styles.accordionBtn} onClick={() => setOpen(!open)}>
                <span>{q}</span>
                <ChevronDown size={18} className={`${styles.accordionIcon} ${open ? styles.accordionIconOpen : ""}`} />
            </button>
            <div className={`${styles.accordionContent} ${open ? styles.accordionContentOpen : ""}`}>
                <p className={styles.accordionText}>{a}</p>
            </div>
        </div>
    );
}

export default function GuidePage() {
    return (
        <main className={styles.page}>
            <div className={styles.bgGlow1} />
            <div className={styles.bgGlow2} />

            <Header />

            {/* ─── Hero ─── */}
            <section className={styles.hero}>
                <FadeUp>
                    <div className={styles.heroBadge}>
                        <Sparkles size={14} />
                        راهنمای استفاده
                    </div>
                    <h1 className={styles.heroTitle}>
                        چطور از <span className={styles.heroAccent}>فیت‌بانو</span> استفاده کنم؟
                    </h1>
                    <p className={styles.heroDesc}>
                        همه چیز از شروع تا دسترسی به برنامه‌هات — در چند دقیقه
                    </p>
                </FadeUp>
            </section>

            {/* ─── Steps ─── */}
            <section className={styles.stepsSection}>
                <div className={styles.sectionHead}>
                    <FadeUp>
                        <h2 className={styles.sectionTitle}>مراحل کار</h2>
                        <p className={styles.sectionDesc}>چهار قدم ساده تا یه برنامه اختصاصی</p>
                    </FadeUp>
                </div>

                <div className={styles.stepsGrid}>
                    {steps.map((step, idx) => (
                        <FadeUp key={idx} delay={idx * 100}>
                            <div className={styles.stepCard}>
                                <div className={styles.stepNum}>{idx + 1}</div>
                                <div className={styles.stepIcon}>
                                    <step.icon size={22} />
                                </div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.desc}</p>
                                <span className={styles.stepHighlight}>
                                    <CheckCircle2 size={12} />
                                    {step.highlight}
                                </span>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className={styles.faqSection}>
                <div className={styles.sectionHead}>
                    <FadeUp>
                        <div className={styles.faqBadge}>
                            <HelpCircle size={14} />
                            سوالات متداول
                        </div>
                        <h2 className={styles.sectionTitle}>سوالات رایج</h2>
                    </FadeUp>
                </div>

                <div className={styles.faqList}>
                    <FadeUp>
                        {faqs.map((faq, idx) => (
                            <Accordion key={idx} q={faq.q} a={faq.a} />
                        ))}
                    </FadeUp>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className={styles.ctaSection}>
                <FadeUp>
                    <div className={styles.ctaCard}>
                        <div className={styles.ctaGlow} />
                        <h2 className={styles.ctaTitle}>آماده‌ای شروع کنی؟</h2>
                        <p className={styles.ctaDesc}>
                            فقط چند دقیقه تا یه برنامه اختصاصی فاصله داری
                        </p>
                        <Link href="/quiz" className={styles.ctaBtn}>
                            ساخت برنامه
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </FadeUp>
            </section>

            <Footer />
        </main>
    );
}
