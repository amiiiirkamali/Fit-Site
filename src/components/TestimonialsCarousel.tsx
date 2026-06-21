"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star } from "lucide-react";
import styles from "./TestimonialsCarousel.module.css";

interface Testimonial {
    name: string;
    text: string;
    rating: number;
    initials: string;
}

const testimonials: Testimonial[] = [
    {
        name: "سارا",
        text: "برای اولین بار یه برنامه گرفتم که واقعاً حس کردم برای خودم نوشته شده. هم ساده بود هم قابل اجرا.",
        rating: 5,
        initials: "س",
    },
    {
        name: "الهام",
        text: "از اینکه تمرین‌ها با شرایط من تنظیم شده بودن خیلی خوشم اومد. نه سختِ بی‌منطق، نه سطحی.",
        rating: 5,
        initials: "ا",
    },
    {
        name: "مریم",
        text: "برنامه غذایی خیلی تمیز و شیک بود. از ظاهر تا منطق برنامه حس حرفه‌ای بودن می‌داد.",
        rating: 5,
        initials: "م",
    },
    {
        name: "نرگس",
        text: "چندتا برنامه‌ی دیگه رو امتحان کرده بودم ولی هیچ‌کدوم اینقدر دقیق نبودن. واقعاً شخصی‌سازیه.",
        rating: 5,
        initials: "ن",
    },
    {
        name: "زهرا",
        text: "تمرین‌ها رو توی خونه انجام می‌دم. بدون تجهیزات خاص، جواب گرفتم. عالیه.",
        rating: 4,
        initials: "ز",
    },
    {
        name: "فاطمه",
        text: "پشتیبونیش عالیه. هرجا سوال داشتم سریع جواب دادن. برنامه هم که فوق‌العاده‌ست.",
        rating: 5,
        initials: "ف",
    },
    {
        name: "رقیه",
        text: "بعد از زایمان دنبال یه برنامه‌ی ملایم بودم. فیت‌بانو دقیقاً همون چیزی بود که نیاز داشتم.",
        rating: 5,
        initials: "ر",
    },
];

function toPersianNum(num: number): string {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    return num.toString().split("").map(d => persianDigits[parseInt(d)] || d).join("");
}

export default function TestimonialsCarousel() {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const goTo = useCallback((index: number, dir: "next" | "prev" = "next") => {
        if (isAnimating || index === active) return;
        setDirection(dir);
        setIsAnimating(true);
        setTimeout(() => {
            setActive(index);
            setTimeout(() => setIsAnimating(false), 50);
        }, 300);
    }, [active, isAnimating]);

    const goNext = useCallback(() => {
        goTo((active + 1) % testimonials.length, "next");
    }, [active, goTo]);

    const goPrev = useCallback(() => {
        goTo((active - 1 + testimonials.length) % testimonials.length, "prev");
    }, [active, goTo]);

    useEffect(() => {
        if (isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(goNext, 5000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [goNext, isPaused]);

    const resetInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!isPaused) intervalRef.current = setInterval(goNext, 5000);
    };

    const handleDotClick = (index: number) => {
        goTo(index, index > active ? "next" : "prev");
        resetInterval();
    };

    const handleNav = (dir: "next" | "prev") => {
        if (dir === "next") goNext();
        else goPrev();
        resetInterval();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
            if (dx > 0) goPrev();
            else goNext();
            resetInterval();
        }
        touchStartX.current = null;
    };

    const current = testimonials[active];

    return (
        <section className={`${styles.section} ${isVisible ? styles.visible : ""}`} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.testimonialArea}>
                    <div
                        className={styles.card}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className={styles.cardProgress}>
                            <div
                                className={`${styles.cardProgressBar} ${isPaused ? styles.cardProgressPaused : ""}`}
                                key={`${active}-${isPaused ? "p" : "r"}`}
                            />
                        </div>

                        <div className={`${styles.cardContent} ${isAnimating ? (direction === "next" ? styles.slideOutLeft : styles.slideOutRight) : styles.slideIn}`}>
                            <div className={styles.topRow}>
                                <div className={styles.author}>
                                    <div className={styles.avatar}>{current.initials}</div>
                                    <div>
                                        <div className={styles.authorName}>{current.name}</div>
                                    </div>
                                </div>

                                <div className={styles.starsWrapper}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < current.rating ? styles.starFilled : styles.starEmpty}
                                        />
                                    ))}
                                                </div>
                            </div>

                            <div className={styles.textWrap}>
                                <blockquote className={styles.text}>«{current.text}»</blockquote>
                            </div>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        <button className={styles.controlBtn} onClick={() => handleNav("prev")} aria-label="قبلی">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className={styles.dots}>
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
                                    onClick={() => handleDotClick(index)}
                                    aria-label={`نظر ${toPersianNum(index + 1)}`}
                                />
                            ))}
                        </div>

                        <button className={styles.controlBtn} onClick={() => handleNav("next")} aria-label="بعدی">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
