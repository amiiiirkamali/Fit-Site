"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Shield, Sparkles, Minus, Plus } from "lucide-react";
import styles from "./page.module.css";

const BASE_PRICE = 499000;

const features = [
    "برنامه غذایی ۳۰ روزه اختصاصی",
    "برنامه ورزشی ۳۰ روزه",
    "گیف آموزشی تمام حرکات",
    "دسترسی همیشگی به برنامه",
];

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [programsCount, setProgramsCount] = useState(1);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t) {
            router.push("/");
            return;
        }
        setToken(t);
    }, [router]);

    const totalPrice = BASE_PRICE * programsCount;
    const totalLabel = toPersianNum(totalPrice);

    const handlePayment = async () => {
        if (!token) return;

        setLoading(true);

        try {
            const res = await fetch("/api/payment/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: totalPrice,
                    planType: "monthly",
                    programsCount,
                }),
            });

            const data = await res.json();

            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                alert(data.message || "خطا در اتصال به درگاه پرداخت");
            }
        } catch {
            alert("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowRight size={18} />
                </button>
                <span className={styles.logo}>فیت‌بانو</span>
                <div className={styles.headerSpacer} />
            </header>

            <section className={styles.content}>
                <div className={styles.topSection}>
                    <div className={styles.badge}>
                        <Sparkles size={14} />
                        آخرین قدم
                    </div>
                    <h1 className={styles.title}>برنامه‌هایت آماده‌ست!</h1>
                    <p className={styles.subtitle}>
                        تعداد برنامه‌هایی که می‌خوای رو انتخاب کن و بعد پرداخت رو انجام بده
                    </p>
                </div>

                <div className={styles.planCard}>
                    <div className={styles.planHeader}>
                        <div className={styles.planIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            <div className={styles.planIconRing} />
                        </div>
                        <div>
                            <h2 className={styles.planName}>برنامه شخصی</h2>
                            <span className={styles.planDuration}>۳۰ روزه</span>
                        </div>
                    </div>

                    {/* ─── Quantity Selector ─── */}
                    <div className={styles.quantitySection}>
                        <span className={styles.quantityLabel}>تعداد برنامه</span>
                        <div className={styles.quantityControls}>
                            <button
                                className={styles.quantityBtn}
                                onClick={() => setProgramsCount(Math.max(1, programsCount - 1))}
                                disabled={programsCount <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className={styles.quantityValue}>{toPersianNum(programsCount)}</span>
                            <button
                                className={styles.quantityBtn}
                                onClick={() => setProgramsCount(Math.min(50, programsCount + 1))}
                                disabled={programsCount >= 50}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.priceAmount}>{totalLabel}</span>
                        <span className={styles.priceCurrency}>تومان</span>
                    </div>

                    {programsCount > 1 && (
                        <div className={styles.priceBreakdown}>
                            {toPersianNum(BASE_PRICE)} تومان × {toPersianNum(programsCount)} برنامه
                        </div>
                    )}

                    <div className={styles.divider} />

                    <ul className={styles.features}>
                        {features.map((f, i) => (
                            <li key={i}>
                                <span className={styles.checkWrap}>
                                    <Check size={14} />
                                </span>
                                {f}
                            </li>
                        ))}
                        <li>
                            <span className={styles.checkWrap}>
                                <Check size={14} />
                            </span>
                            {programsCount} برنامه مجزا با شماره
                        </li>
                    </ul>
                </div>

                <button
                    className={styles.payBtn}
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.btnSpinner} />
                            در حال اتصال به درگاه...
                        </>
                    ) : (
                        <>
                            پرداخت {totalLabel} تومان
                        </>
                    )}
                </button>

                <div className={styles.guarantee}>
                    <Shield size={14} />
                    <span>پرداخت امن با ضمانت زرین‌پال</span>
                </div>
            </section>
        </main>
    );
}
