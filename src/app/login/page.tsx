"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import styles from "./page.module.css";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"phone" | "otp">("phone");
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
                    // In mock mode, show the code
                    console.log("OTP Code:", data.code);
                }
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
        if (otp.length < 5) return;

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
                    setError("هنوز خریدی ثبت نشده. برای شروع برنامه کلیک کنید.");
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

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push("/")}>
                    →
                </button>
                <span className={styles.logo}>فیت‌بانو</span>
                <div />
            </header>

            <section className={styles.content}>
                {step === "phone" ? (
                    <>
                        <div className={styles.iconCircle}>📱</div>
                        <h1 className={styles.title}>ورود به حساب کاربری</h1>
                        <p className={styles.subtitle}>
                            شماره موبایلت رو وارد کن تا کد تأیید برات بفرستیم
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
                        <div className={styles.iconCircle}>🔐</div>
                        <h1 className={styles.title}>کد تأیید</h1>
                        <p className={styles.subtitle}>
                            کد ۵ رقمی ارسال‌شده به {phone} رو وارد کن
                        </p>

                        <OtpInput length={5} value={otp} onChange={setOtp} />

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            className={styles.submitBtn}
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.length < 5}
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
            </section>
        </main>
    );
}