"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import ProgressBar from "@/components/ProgressBar";
import { toPersianDigits } from "@/lib/persian";
import styles from "./page.module.css";

const loadingSteps = [
    { label: "تحلیل پاسخ‌ها", icon: "📊", desc: "بررسی اطلاعات شما" },
    { label: "ساخت پروفایل تمرینی", icon: "🏋️‍♀️", desc: "تعیین سطح و اهداف" },
    { label: "ساخت برنامه‌ی اختصاصی", icon: "📋", desc: "طراحی برنامه روزانه" },
    { label: "نهایی‌سازی جزئیات", icon: "✨", desc: "آماده‌سازی نهایی" },
];

export default function LoadingPlanPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<"loading" | "phone" | "otp">("loading");
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [showContinue, setShowContinue] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showContinue || phase === "phone" || phase === "otp") {
            mainRef.current?.focus();
        }
    }, [showContinue, phase]);

    useEffect(() => {
        if (phase !== "loading") return;

        const timers: NodeJS.Timeout[] = [];

        loadingSteps.forEach((_, idx) => {
            const startDelay = idx * 1500;

            timers.push(
                setTimeout(() => {
                    setActiveStep(idx);

                    let p = 0;
                    const interval = setInterval(() => {
                        p += Math.random() * 15 + 5;
                        if (p >= 100) {
                            p = 100;
                            clearInterval(interval);

                            if (idx === loadingSteps.length - 1) {
                                setTimeout(() => setShowContinue(true), 600);
                            }
                        }
                        setProgress((prev) => {
                            const newP = [...prev];
                            newP[idx] = Math.min(p, 100);
                            return newP;
                        });
                    }, 100);

                    timers.push(interval as unknown as NodeJS.Timeout);
                }, startDelay)
            );
        });

        return () => timers.forEach(clearTimeout);
    }, [phase]);

    const startCountdown = () => {
        setCountdown(90);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async () => {
        const formattedPhone = phone.startsWith("0") ? phone : `0${phone}`;
        if (formattedPhone.length !== 11 || !formattedPhone.startsWith("09")) {
            setError("شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formattedPhone }),
            });

            const data = await res.json();

            if (data.success) {
                setPhase("otp");
                startCountdown();
            } else {
                setError(data.message || "خطا در ارسال کد");
            }
        } catch {
            setError("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSubmit = async () => {
        if (otp.length < 6) return;

        setLoading(true);
        setError("");

        const formattedPhone = phone.startsWith("0") ? phone : `0${phone}`;

        try {
            const verifyRes = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formattedPhone, code: otp }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                setError(verifyData.message || "کد وارد شده اشتباه است");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", verifyData.token);

            const quizAnswers = JSON.parse(
                sessionStorage.getItem("quizAnswers") || "{}"
            );

            await fetch("/api/quiz/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${verifyData.token}`,
                },
                body: JSON.stringify({ answers: quizAnswers }),
            });

            if (verifyData.hasPaid) {
                router.push("/dashboard");
            } else {
                router.push("/checkout");
            }
        } catch {
            setError("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    // ---------- LOADING PHASE ----------
    if (phase === "loading") {
        const virtualCurrent = Math.max(-1, activeStep - 1 + (progress[activeStep] / 100));

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && showContinue) {
                setPhase("phone");
            }
        };

        return (
            <main ref={mainRef} className={styles.page} tabIndex={-1} onKeyDown={handleKeyDown}>
                <div className={styles.bgGlowOne} />
                <div className={styles.bgGlowTwo} />

                <header className={styles.header}>
                    <div className={styles.headerInner}>
                        <div className={styles.logo}>فیت‌بانو</div>
                    </div>
                    <ProgressBar current={virtualCurrent} total={loadingSteps.length} />
                </header>

                <section className={styles.loadingContent}>
                    <div className={styles.steps}>
                        {loadingSteps.map((step, idx) => {
                            const isDone = progress[idx] >= 100;
                            const isActive = idx === activeStep && !isDone;
                            const isPending = idx > activeStep;

                            return (
                                <div
                                    key={idx}
                                    className={`${styles.stepRow} ${
                                        isDone ? styles.stepDone : ""
                                    } ${isActive ? styles.stepActive : ""} ${
                                        isPending ? styles.stepPending : ""
                                    }`}
                                >
                                    <div className={styles.stepIconWrap}>
                                        {isDone ? (
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        ) : (
                                            <span className={styles.stepEmoji}>{step.icon}</span>
                                        )}
                                    </div>

                                    <div className={styles.stepInfo}>
                                        <div className={styles.stepTopRow}>
                                            <span className={styles.stepLabel}>{step.label}</span>
                                            <span className={styles.stepPercent}>
                        {Math.round(progress[idx])}٪
                      </span>
                                        </div>
                                        <div className={styles.stepTrack}>
                                            <div
                                                className={styles.stepFill}
                                                style={{ width: `${progress[idx]}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showContinue && (
                        <button
                            className={styles.continueBtn}
                            onClick={() => setPhase("phone")}
                        >
                            ادامه
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    )}
                </section>
            </main>
        );
    }

    const phoneError = phone.length > 0 && (phone.length < 11 ? "شماره موبایل باید ۱۱ رقم باشد" : !phone.startsWith("09") ? "شماره موبایل باید با ۰۹ شروع شود" : "");

    const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (phase === "phone" && !loading && phone.length === 11 && phone.startsWith("09")) {
                handleSendOtp();
            } else if (phase === "otp" && !loading && otp.length === 6) {
                handleVerifyAndSubmit();
            }
        }
    };

    // ---------- PHONE / OTP PHASE ----------
    return (
        <main ref={mainRef} className={styles.page} tabIndex={-1} onKeyDown={handlePhoneKeyDown}>
            <div className={styles.bgGlowOne} />
            <div className={styles.bgGlowTwo} />

            <section className={styles.phoneContent}>
                {phase === "phone" ? (
                    <>
                        <div className={styles.successBadge}>
                            <div className={styles.successRing}>
                                <svg
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className={styles.successPulse} />
                        </div>

                        <h1 className={styles.title}>
                            یک قدم تا <span className={styles.titleAccent}>برنامه‌ی تو</span>
                        </h1>
                        <p className={styles.subtitle}>
                            برای ذخیره و دسترسی همیشگی به برنامه‌ت، شماره موبایلت رو وارد کن
                        </p>

                        <div className={styles.formCard}>
                            <label className={styles.fieldLabel}>شماره موبایل</label>
                            <div className={styles.phoneInputWrap}>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    className={styles.phoneInput}
                                    placeholder={toPersianDigits("09123456789")}
                                    value={toPersianDigits(phone)}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^\d۰-۹]/g, "");
                                        const english = raw.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                                        setPhone(english);
                                        if (error) setError("");
                                    }}
                                    maxLength={11}
                                />
                                <div className={styles.phoneBadge}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                            </div>

                            {(phoneError || error) && (
                                <p className={styles.error}>
                                    <span>⚠️</span> {error || phoneError}
                                </p>
                            )}

                            <button
                                className={styles.submitBtn}
                                onClick={handleSendOtp}
                                disabled={loading || !!phoneError}
                            >
                                {loading ? (
                                    <>
                                        <span className={styles.btnSpinner} />
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        ارسال کد تأیید
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12 19 5 12 12 5"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        <p className={styles.legal}>
                            با ادامه دادن، با{" "}
                            <a href="#">قوانین و حریم خصوصی</a> موافقت می‌کنی
                        </p>
                    </>
                ) : (
                    <>
                        <div className={styles.lockBadge}>
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>

                        <span className={styles.eyebrow}>تأیید شماره</span>
                        <h1 className={styles.title}>کد تأیید رو وارد کن</h1>
                        <p className={styles.subtitle}>
                            کد ۶ رقمی به شماره{" "}
                            <strong className={styles.phoneHighlight} dir="ltr">
                                {phone}
                            </strong>{" "}
                            ارسال شد
                        </p>

                        <div className={styles.formCard}>
                            <div className={styles.otpWrap}>
                                <OtpInput length={6} value={otp} onChange={setOtp} />
                            </div>

                            {error && (
                                <p className={styles.error}>
                                    <span>⚠️</span> {error}
                                </p>
                            )}

                            <button
                                className={styles.submitBtn}
                                onClick={handleVerifyAndSubmit}
                                disabled={loading || otp.length < 6}
                            >
                                {loading ? (
                                    <>
                                        <span className={styles.btnSpinner} />
                                        در حال بررسی...
                                    </>
                                ) : (
                                    <>
                                        تأیید و ادامه
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12 19 5 12 12 5"></polyline>
                                        </svg>
                                    </>
                                )}
                            </button>

                            <button
                                className={styles.resendBtn}
                                onClick={() => {
                                    setOtp("");
                                    handleSendOtp();
                                }}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? (
                                    <>
                                        <span className={styles.countdownDot} />
                                        ارسال مجدد تا {countdown} ثانیه دیگر
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 4 23 10 17 10"></polyline>
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                        </svg>
                                        ارسال مجدد کد
                                    </>
                                )}
                            </button>
                        </div>

                        <button
                            className={styles.changeBtn}
                            onClick={() => {
                                setPhase("phone");
                                setOtp("");
                                setError("");
                            }}
                        >
                            تغییر شماره موبایل
                        </button>
                    </>
                )}
            </section>
        </main>
    );
}