"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizSteps } from "@/lib/quizData";
import ProgressBar from "@/components/ProgressBar";
import QuizOption from "@/components/QuizOption";
import NumberInput from "@/components/NumberInput";
import InsightScreen from "@/components/InsightScreen";
import TestimonialCard from "@/components/TestimonialCard";
import BehaviorProfile from "@/components/BehaviorProfile";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

export default function QuizPage() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const step = quizSteps[current];
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (step.type === "insight" || step.type === "testimonial" || step.type === "behavior") {
            mainRef.current?.focus();
        }
    }, [current, step.type]);

    const handleSingleSelect = useCallback(
        (val: string) => {
            setAnswers((prev) => ({ ...prev, [step.key]: val }));
            setTimeout(() => {
                if (current < quizSteps.length - 1) {
                    setCurrent((c) => c + 1);
                }
            }, 300);
        },
        [current, step.key]
    );

    const handleMultiSelect = useCallback(
        (val: string) => {
            setAnswers((prev) => {
                const existing = prev[step.key] || "";
                const arr = existing ? existing.split(",") : [];

                if (val === "none") {
                    return { ...prev, [step.key]: "none" };
                }

                const filtered = arr.filter((v) => v !== "none");

                if (filtered.includes(val)) {
                    const newArr = filtered.filter((v) => v !== val);
                    return { ...prev, [step.key]: newArr.join(",") };
                } else {
                    return { ...prev, [step.key]: [...filtered, val].join(",") };
                }
            });
        },
        [step.key]
    );

    const handleNext = () => {
        if (current < quizSteps.length - 1) {
            setCurrent(current + 1);
        } else {
            sessionStorage.setItem("quizAnswers", JSON.stringify(answers));
            router.push("/loading-plan");
        }
    };

    const handleBack = () => {
        if (current > 0) {
            setCurrent(current - 1);
        } else {
            router.push("/");
        }
    };

    const canProceed = () => {
        if (step.type === "insight" || step.type === "testimonial" || step.type === "behavior") return true;
        if (step.type === "text") return !!(answers[step.key] && answers[step.key].trim().length > 0);
        if (step.type === "single") return !!answers[step.key];
        if (step.type === "multiple") return !!answers[step.key];
        if (step.type === "number") {
            const val = parseInt(answers[step.key]);
            return !isNaN(val) && (!step.min || val >= step.min) && (!step.max || val <= step.max);
        }
        return false;
    };

    const showBottomBar = (): boolean => {
        return (
            step.type === "insight" ||
            step.type === "testimonial" ||
            step.type === "behavior" ||
            step.type === "text" ||
            step.type === "number" ||
            step.type === "multiple"
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (
            e.key === "Enter" &&
            canProceed() &&
            showBottomBar()
        ) {
            handleNext();
        }
    };

    return (
        <main ref={mainRef} className={styles.page} tabIndex={-1} onKeyDown={handleKeyDown}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    {current > 0 && <BackButton onClick={handleBack} />}
                    <div className={styles.logo}>فیت‌بانو</div>
                </div>
                <ProgressBar
                    current={current}
                    total={quizSteps.length}
                />
            </header>

            <section className={styles.content}>
                {step.type === "insight" ? (
                    <InsightScreen
                        title={step.title}
                        text={step.insightText || ""}
                        icon={step.insightIcon}
                    />
                ) : step.type === "testimonial" ? (
                    <TestimonialCard
                        title={step.title}
                        quote={step.quote || ""}
                        author={step.author || ""}
                        rating={step.rating || 5}
                    />
                ) : step.type === "behavior" ? (
                    <BehaviorProfile
                        title={step.title}
                        description={step.profileDescription || ""}
                        nextSteps={step.nextSteps || ""}
                    />
                ) : (
                    <div key={current} className={styles.questions}>
                        <h1 className={styles.title}>{step.title}</h1>
                        {step.subtitle && (
                            <p className={styles.subtitle}>{step.subtitle}</p>
                        )}

                        <div className={styles.optionsContainer}>
                            {step.type === "single" &&
                                step.options?.map((opt) => (
                                    <QuizOption
                                        key={opt.value}
                                        label={opt.label}
                                        icon={opt.icon}
                                        selected={answers[step.key] === opt.value}
                                        onClick={() => handleSingleSelect(opt.value)}
                                    />
                                ))}

                            {step.type === "multiple" &&
                                step.options?.map((opt) => {
                                    const selected = (answers[step.key] || "")
                                        .split(",")
                                        .includes(opt.value);
                                    return (
                                        <QuizOption
                                            key={opt.value}
                                            label={opt.label}
                                            icon={opt.icon}
                                            selected={selected}
                                            onClick={() => handleMultiSelect(opt.value)}
                                        />
                                    );
                                })}

                            {step.type === "number" && (
                                <NumberInput
                                    value={answers[step.key] || ""}
                                    onChange={(val) =>
                                        setAnswers((prev) => ({ ...prev, [step.key]: val }))
                                    }
                                    placeholder={step.placeholder}
                                    unit={step.unit}
                                    min={step.min}
                                    max={step.max}
                                />
                            )}

                            {step.type === "text" && (
                                <div className={styles.textInputWrap}>
                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={answers[step.key] || ""}
                                        onChange={(e) =>
                                            setAnswers((prev) => ({ ...prev, [step.key]: e.target.value }))
                                        }
                                        placeholder={step.placeholder}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {showBottomBar() && (
                <div className={styles.bottomBar}>
                    <button
                        className={styles.nextBtn}
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        ادامه
                    </button>
                </div>
            )}
        </main>
    );
}
