"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const plans = [
  {
    id: "monthly",
    name: "پلن ماهانه",
    price: 149000,
    priceLabel: "۱۴۹,۰۰۰",
    duration: "۱ ماه",
    features: ["برنامه‌ی غذایی ۷ روزه", "برنامه‌ی ورزشی هفتگی", "گیف آموزشی حرکات"],
    popular: false,
  },
  {
    id: "quarterly",
    name: "پلن سه‌ماهه",
    price: 349000,
    priceLabel: "۳۴۹,۰۰۰",
    duration: "۳ ماه",
    features: [
      "برنامه‌ی غذایی ۷ روزه",
      "برنامه‌ی ورزشی هفتگی",
      "گیف آموزشی حرکات",
      "بازسازی برنامه هر ماه",
      "۳۰٪ تخفیف",
    ],
    popular: true,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
  }, [router]);

  const handlePayment = async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan || !token) return;

    setLoading(true);

    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: plan.price,
          planType: plan.id,
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
          ←
        </button>
        <span className={styles.headerTitle}>انتخاب پلن</span>
        <div />
      </header>

      <section className={styles.content}>
        <h1 className={styles.title}>برنامه‌ت آماده‌ست!</h1>
        <p className={styles.subtitle}>
          پلن مورد نظرت رو انتخاب کن و برنامه‌ی اختصاصیت رو ببین
        </p>

        <div className={styles.plans}>
          {plans.map((plan) => (
            <button
              key={plan.id}
              className={`${styles.planCard} ${
                selectedPlan === plan.id ? styles.planSelected : ""
              } ${plan.popular ? styles.planPopular : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <span className={styles.badge}>پرطرفدار</span>
              )}
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>{plan.priceLabel}</span>
                <span className={styles.priceCurrency}>تومان</span>
              </div>
              <span className={styles.planDuration}>{plan.duration}</span>
              <ul className={styles.features}>
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <span className={styles.checkIcon}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <button
          className={styles.payBtn}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "در حال اتصال به درگاه..." : "پرداخت و دریافت برنامه"}
        </button>

        <p className={styles.guarantee}>
          🔒 پرداخت امن از طریق درگاه زرین‌پال
        </p>
      </section>
    </main>
  );
}
