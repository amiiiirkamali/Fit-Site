"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [refId, setRefId] = useState("");

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const paymentStatus = searchParams.get("Status");

    if (!authority || paymentStatus !== "OK") {
      setStatus("failed");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("failed");
      return;
    }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ authority }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRefId(data.refId);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.spinner} />
          <h1 className={styles.title}>در حال بررسی پرداخت...</h1>
        </div>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.statusIcon}>
            <span className={styles.iconFail}>✕</span>
          </div>
          <h1 className={styles.title}>پرداخت ناموفق</h1>
          <p className={styles.subtitle}>
            متأسفانه پرداخت شما تأیید نشد. لطفاً دوباره تلاش کنید.
          </p>
          <button
            className={styles.btn}
            onClick={() => router.push("/checkout")}
          >
            بازگشت به صفحه پرداخت
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.statusIcon}>
          <span className={styles.iconSuccess}>✓</span>
        </div>
        <h1 className={styles.title}>پرداخت موفق!</h1>
        <p className={styles.subtitle}>
          کد پیگیری: {refId}
          <br />
          برنامه‌ی اختصاصی شما با موفقیت ساخته شد
        </p>
        <button
          className={styles.btn}
          onClick={() => router.push("/dashboard")}
        >
          مشاهده‌ی برنامه‌ها
        </button>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.content}>
            <div className={styles.spinner} />
          </div>
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
