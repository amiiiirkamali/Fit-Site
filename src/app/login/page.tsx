"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import { toPersianDigits } from "@/lib/persian";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<"phone" | "otp" | "unpaid">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

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
    if (phone.length < 10) {
      setError("شماره موبایل معتبر وارد کنید");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.startsWith("0") ? phone : `0${phone}` }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
        startCountdown();
        if (data.code) {
          console.log("OTP Code:", data.code);
        }
      } else if (data.code === "NOT_PAID") {
        setStep("unpaid");
      } else {
        setError(data.message || "خطا در ارسال کد");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.startsWith("0") ? phone : `0${phone}`,
          code: otp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);

        if (data.hasPaid) {
          router.push("/dashboard");
        } else {
          setStep("unpaid");
        }
      } else {
        setError(data.message || "کد وارد شده اشتباه است");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const phoneError = phone.length > 0 && (phone.length < 11 ? "شماره موبایل باید ۱۱ رقم باشد" : !phone.startsWith("09") ? "شماره موبایل باید با ۰۹ شروع شود" : "");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === "phone" && !loading && phone.length === 11 && phone.startsWith("09")) {
      handleSendOtp();
    }
  };

  useEffect(() => {
    mainRef.current?.focus();
  }, [step]);

  return (
    <main className={styles.page}>
      <div className={styles.bgMesh} />
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${15 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i * 1.5}s`,
            }}
          />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
            </svg>
          </div>
          <span className={styles.logo}>فیت‌بانو</span>
        </div>
        <button className={styles.backBtn} onClick={() => router.push("/")} aria-label="بازگشت">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </header>

      <section className={styles.content}>
        <div ref={mainRef} className={styles.card} tabIndex={-1} onKeyDown={handleKeyDown}>
          {step === "phone" ? (
            <>
              <div className={styles.iconCircle}>📱</div>
              <h1 className={styles.title}>ورود به حساب کاربری</h1>
              <p className={styles.subtitle}>
                شماره موبایلت رو وارد کن تا کد تأیید برات بفرستیم
              </p>

              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  className={styles.phoneInput}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={toPersianDigits(phone)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d۰-۹]/g, "");
                    const english = raw.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                    setPhone(english);
                    if (error) setError("");
                  }}
                  maxLength={11}
                  dir="ltr"
                />
              </div>

              {(phoneError || error) && <p className={styles.error}>{error || phoneError}</p>}

              <button
                className={styles.submitBtn}
                onClick={handleSendOtp}
                disabled={loading || !!phoneError}
              >
                {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
              </button>
            </>
          ) : step === "unpaid" ? (
            <>
              <div className={styles.iconCircle}>📋</div>
              <h1 className={styles.title}>هنوز خریدی ثبت نشده</h1>
              <p className={styles.subtitle}>
                برای شروع برنامه و دریافت رژیم اختصاصی، لطفاً ابتدا سوالات رو جواب بده
              </p>

              <button
                className={styles.submitBtn}
                onClick={() => router.push("/quiz")}
              >
                شروع برنامه
              </button>
            </>
          ) : (
            <>
              <div className={styles.iconCircle}>🔐</div>
              <h1 className={styles.title}>کد تأیید</h1>
              <p className={styles.subtitle}>
                کد ۶ رقمی ارسال‌شده به {phone} رو وارد کن
              </p>

              <OtpInput length={6} value={otp} onChange={setOtp} />

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.submitBtn}
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
              >
                {loading ? "در حال بررسی..." : "تأیید و ورود"}
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
        </div>
      </section>
    </main>
  );
}
