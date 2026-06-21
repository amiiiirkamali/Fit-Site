"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import styles from "./Footer.module.css";

function TelegramIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    );
}

export default function Footer() {
    return (
        <footer className={styles.footer}>
            {/* Decorative Top Wave */}
            <div className={styles.waveWrap}>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={styles.waveSvg}>
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className={styles.wavePath} />
                </svg>
                <div className={styles.waveAccent} />
                <div className={styles.waveAccent2} />
                <div className={styles.waveAccent3} />
            </div>

            {/* Decorative Blur Circles */}
            <div className={styles.blurCircle1} />
            <div className={styles.blurCircle2} />

            <div className={styles.inner}>
                {/* Main Grid */}
                <div className={styles.grid}>
                    {/* Logo & Description */}
                    <div className={styles.brandCol}>
                        <div className={styles.logoWrap}>
                            <div className={styles.logoGlow} />
                            <div className={styles.logoBox}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className={styles.logoText}>فیت‌بانو</span>
                        </div>

                        <p className={styles.description}>
                            پلتفرم هوشمند برای تحول در سبک زندگی شما. با فیت‌بانو به بهترین نسخه از خودتان تبدیل شوید.
                        </p>

                        {/* Social */}
                        <div className={styles.socialArea}>
                            <h4 className={styles.socialTitle}>ما را دنبال کنید</h4>
                            <div className={styles.socialRow}>
                                <a href="https://t.me/fitsinggroup" className={styles.socialLink} aria-label="تلگرام">
                                    <TelegramIcon />
                                </a>
                                <a href="https://www.instagram.com/fitsing.co?igsh=OW9pcjNvMWkxYzdh" className={styles.socialLink} aria-label="اینستاگرام">
                                    <InstagramIcon />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.linkCol}>
                        <h3 className={styles.colTitle}>
                            <span className={styles.colTitleLine} />
                            دسترسی سریع
                        </h3>
                        <ul className={styles.linkList}>
                            {[
                                { label: "صفحه اصلی", href: "/" },
                                { label: "امکانات", href: "#features" },
                                { label: "ورود", href: "/login" },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link href={item.href} className={styles.linkItem}>
                                        <span className={styles.linkHoverLine} />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className={styles.linkCol}>
                        <h3 className={styles.colTitle}>
                            <span className={styles.colTitleLine} />
                            خدمات ما
                        </h3>
                        <ul className={styles.linkList}>
                            {[
                                { label: "کاهش وزن", href: "/quiz" },
                                { label: "بدنسازی", href: "/quiz" },
                                { label: "فرم‌دهی باسن", href: "/quiz" },
                                { label: "افزایش وزن", href: "/quiz" },
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link href={item.href} className={styles.linkItem}>
                                        <span className={styles.linkHoverLine} />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Trust Badges */}
                    <div className={styles.trustCol}>
                        <h3 className={styles.colTitle}>
                            <span className={styles.colTitleLine} />
                            نمادهای اعتماد
                        </h3>
                        <div className={styles.badgesRow}>
                            <div className={styles.badgeCard}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>اینماد</span>
                            </div>
                            <div className={styles.badgeCard}>
                                <CheckCircle size="24" className={styles.badgeCheck} />
                                <span>تضمین کیفیت</span>
                            </div>
                        </div>
                        <div className={styles.paymentRow}>
                            {["زرین‌پال", "ملت", "سپ", "سپهر"].map((name, i) => (
                                <div key={i} className={styles.paymentBadge}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <div className={styles.dividerDot} />
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © ۱۴۰۴ — فیت‌بانو • تمامی حقوق محفوظ است
                    </p>
                    <div className={styles.signature}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/sign/signature.png" alt="امضا" className={styles.signImg} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
