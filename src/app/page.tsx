"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user && data.user.hasPaid) {
            setIsLoggedIn(true);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }

  if (isLoggedIn) {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>برنامه‌ساز اختصاصی خانم‌ها</div>
          <h1 className={styles.title}>
            برنامه‌ی غذایی و ورزشی<br />
            <span className={styles.accent}>مخصوص بدن تو</span>
          </h1>
          <p className={styles.subtitle}>
            با پاسخ به چند سوال ساده، یک برنامه‌ی شخصی‌سازی‌شده دریافت کن که
            متناسب با هدف، سطح فعالیت و شرایط بدنی توست.
          </p>

          <button className={styles.ctaBtn} onClick={() => router.push("/quiz")}>
            شروع کن
            <span className={styles.ctaArrow}>←</span>
          </button>

          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>+۲۵۰هزار</span>
              <span className={styles.trustLabel}>کاربر</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>۴.۹</span>
              <span className={styles.trustLabel}>امتیاز</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>۱۰۰٪</span>
              <span className={styles.trustLabel}>اختصاصی</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
