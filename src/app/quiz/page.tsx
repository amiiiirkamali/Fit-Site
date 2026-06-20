"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { quizSteps, TOTAL_SECTIONS } from "@/lib/quizData";
import ProgressBar from "@/components/ProgressBar";
import QuizOption from "@/components/QuizOption";
import NumberInput from "@/components/NumberInput";
import InsightScreen from "@/components/InsightScreen";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

export default function QuizPage() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const step = quizSteps[current];

    // Calculate section progress
    const sectionSteps = quizSteps.filter((s) => s.section === step.section);
    const idxInSection = sectionSteps.indexOf(step);
    const progressInSection =
        sectionSteps.length > 0 ? (idxInSection + 1) / sectionSteps.length : 0;

    const handleSingleSelect = useCallback(
        (val: string) => {
            setAnswers((prev) => ({ ...prev, [step.key]: val }));
            // Auto-advance after selection
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
            // Quiz finished, save answers to sessionStorage and go to phone step
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
        if (step.type === "insight") return true;
        if (step.type === "single") return !!answers[step.key];
        if (step.type === "multiple") return !!answers[step.key];
        if (step.type === "number") {
            const val = parseInt(answers[step.key]);
            return !isNaN(val) && (!step.min || val >= step.min) && (!step.max || val <= step.max);
        }
        return false;
    };

    return (
        <main className={styles.page}>
            <div className={styles.topBar}>
                <BackButton onClick={handleBack} />
                <ProgressBar
                    currentSection={step.section}
                    totalSections={TOTAL_SECTIONS}
                    progressInSection={progressInSection}
                />
            </div>

            <section className={styles.content}>
                {step.type === "insight" ? (
                    <InsightScreen
                        title={step.title}
                        text={step.insightText || ""}
                        icon={step.insightIcon}
                    />
                ) : (
                    <>
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
                        </div>
                    </>
                )}
            </section>

            {/* Show continue button for insight, number, and multiple-choice */}
            {(step.type === "insight" ||
                step.type === "number" ||
                step.type === "multiple") && (
                <div className={styles.bottomBar}>
                    <button
                        className={styles.nextBtn}
                        onClick={handleNext}
                        disabled={!canProceed()}
                    >
                        {current === quizSteps.length - 1 ? "ساخت برنامه" : "ادامه"}
                    </button>
                </div>
            )}
        </main>
    );
}