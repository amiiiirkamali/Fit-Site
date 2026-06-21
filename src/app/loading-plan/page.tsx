"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
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
                                setTimeout(() => setPhase("phone"), 600);
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
        if (formattedPhone.length < 11) {
            setError("شماره موبایل معتبر وارد کنید");
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
        const overallProgress =
            progress.reduce((a, b) => a + b, 0) / loadingSteps.length;

        return (
            <main className={styles.page}>
                <div className={styles.bgGlowOne} />
                <div className={styles.bgGlowTwo} />

                <section className={styles.loadingContent}>
                    <div className={styles.logoWrap}>
                        <div className={styles.logoRing}>
                            <svg viewBox="0 0 100 100" className={styles.ringSvg}>
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="46"
                                    fill="none"
                                    stroke="#f0e8ec"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="46"
                                    fill="none"
                                    stroke="url(#gradPink)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(overallProgress / 100) * 289} 289`}
                                    transform="rotate(-90 50 50)"
                                    className={styles.ringFill}
                                />
                                <defs>
                                    <linearGradient id="gradPink" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#e8568f" />
                                        <stop offset="100%" stopColor="#c2185b" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className={styles.logoCenter}>
                <span className={styles.logoPercent}>
                  {Math.round(overallProgress)}
                    <small>٪</small>
                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.loadingHeader}>
                        <span className={styles.eyebrow}>در حال ساخت برنامه</span>
                        <h1 className={styles.loadingTitle}>
                            لطفاً چند لحظه صبر کن
                        </h1>
                        <p className={styles.loadingSubtitle}>
                            داریم برنامه‌ی اختصاصی تو رو می‌سازیم...
                        </p>
                    </div>

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
                </section>
            </main>
        );
    }

    // ---------- PHONE / OTP PHASE ----------
    return (
        <main className={styles.page}>
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

                        <span className={styles.eyebrow}>برنامه آماده‌ست! 🎉</span>
                        <h1 className={styles.title}>
                            یک قدم تا <span className={styles.titleAccent}>برنامه‌ی تو</span>
                        </h1>
                        <p className={styles.subtitle}>
                            برای ذخیره و دسترسی همیشگی به برنامه‌ت، شماره موبایلت رو وارد کن
                        </p>

                        <div className={styles.formCard}>
                            <label className={styles.fieldLabel}>شماره موبایل</label>
                            <div className={styles.phoneInputWrap}>
                <span className={styles.phonePrefix}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    className={styles.phoneInput}
                                    placeholder="09123456789"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value.replace(/\D/g, ""))
                                    }
                                    maxLength={11}
                                    dir="ltr"
                                />
                            </div>

                            {error && (
                                <p className={styles.error}>
                                    <span>⚠️</span> {error}
                                </p>
                            )}

                            <button
                                className={styles.submitBtn}
                                onClick={handleSendOtp}
                                disabled={loading || phone.length < 10}
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