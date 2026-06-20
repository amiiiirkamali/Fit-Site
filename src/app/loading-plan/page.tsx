"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import styles from "./page.module.css";

const loadingSteps = [
  { label: "تحلیل پاسخ‌ها", icon: "📊" },
  { label: "ساخت پروفایل تمرینی", icon: "🏋️‍♀️" },
  { label: "ساخت برنامه‌ی اختصاصی", icon: "📋" },
  { label: "نهایی‌سازی جزئیات", icon: "✨" },
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
                setTimeout(() => setPhase("phone"), 500);
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

  if (phase === "loading") {
    return (
      <main className={styles.page}>
        <section className={styles.loadingContent}>
          <div className={styles.loadingIcon}>⚙️</div>
          <h1 className={styles.loadingTitle}>
            لطفاً چند لحظه صبر کنید
            <br />
            تا برنامه‌ی شما ساخته شود
          </h1>

          <div className={styles.steps}>
            {loadingSteps.map((step, idx) => (
              <div
                key={idx}
                className={`${styles.stepRow} ${
                  idx <= activeStep ? styles.stepActive : ""
                }`}
              >
                <span className={styles.stepIcon}>{step.icon}</span>
                <div className={styles.stepInfo}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  <div className={styles.stepTrack}>
                    <div
                      className={styles.stepFill}
                      style={{ width: `${progress[idx]}%` }}
                    />
                  </div>
                </div>
                {progress[idx] >= 100 && (
                  <span className={styles.stepCheck}>✓</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.phoneContent}>
        {phase === "phone" ? (
          <>
            <div className={styles.doneIcon}>✓</div>
            <h1 className={styles.title}>برنامه‌ت آماده‌ست!</h1>
            <p className={styles.subtitle}>
              برای ذخیره و دسترسی همیشگی، شماره موبایلت رو وارد کن
            </p>

            <div className={styles.inputWrapper}>
              <input
                type="tel"
                inputMode="numeric"
                className={styles.phoneInput}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={11}
                dir="ltr"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitBtn}
              onClick={handleSendOtp}
              disabled={loading || phone.length < 10}
            >
              {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </>
        ) : (
          <>
            <div className={styles.doneIcon}>🔐</div>
            <h1 className={styles.title}>کد تأیید</h1>
            <p className={styles.subtitle}>
              کد ۶ رقمی ارسال‌شده به {phone} رو وارد کن
            </p>

            <OtpInput length={6} value={otp} onChange={setOtp} />

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitBtn}
              onClick={handleVerifyAndSubmit}
              disabled={loading || otp.length < 6}
            >
              {loading ? "در حال بررسی..." : "تأیید و ادامه"}
            </button>

            <button
              className={styles.resendBtn}
              onClick={() => {
                setOtp("");
                handleSendOtp();
              }}
              disabled={countdown > 0}
            >
              {countdown > 0
                ? `ارسال مجدد (${countdown} ثانیه)`
                : "ارسال مجدد کد"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
