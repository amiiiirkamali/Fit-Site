"use client";

import { useRouter } from "next/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
  const router = useRouter();

  const quickLinks = [
    { label: "صفحه اصلی", path: "/" },
    { label: "درباره ما", path: "/about" },
    { label: "وبلاگ", path: "/blog" },
    { label: "سوالات متداول", path: "/faq" },
    { label: "تماس با ما", path: "/contact" },
  ];

  const contactInfo = [
    { label: "ایمیل", value: "info@fitbanoo.com" },
    { label: "تلفن", value: "۰۲۱-۱۲۳۴۵۶۷۸" },
    { label: "اینستاگرام", value: "@fitbanoo" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <span className={styles.colLogo}>فیت‌بانو</span>
          <p className={styles.colDesc}>
            برنامه‌ی شخصی‌سازی‌شده‌ی غذایی و ورزشی مخصوص خانم‌ها. با فیت‌بانو،
            سلامت و تناسب اندامت رو جدی بگیر.
          </p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>دسترسی سریع</h4>
          <div className={styles.links}>
            {quickLinks.map((link) => (
              <button
                key={link.path}
                className={styles.link}
                onClick={() => router.push(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>ارتباط با ما</h4>
          <div className={styles.contactList}>
            {contactInfo.map((item) => (
              <div key={item.label} className={styles.contactItem}>
                <span className={styles.contactLabel}>{item.label}</span>
                <span className={styles.contactValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © ۱۴۰۴ — تمامی حقوق برای فیت‌بانو محفوظ است.
        </p>
      </div>
    </footer>
  );
}
