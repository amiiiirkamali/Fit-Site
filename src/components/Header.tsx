"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navItems = [
        { label: "راهنما", href: "/guide" },
        { label: "رنک", href: "/rank" },
    ];

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logoWrap}>
                    <div className={styles.logoMark}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className={styles.logoText}>فیت‌بانو</span>
                </Link>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href} className={styles.navLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.actions}>
                    <Link href="/login" className={styles.loginBtn}>
                        ورود
                    </Link>
                    <Link href="/quiz" className={styles.primaryBtn}>
                        شروع کن
                        <span className={styles.primaryBtnArrow}>
                            <ArrowLeft size={14} />
                        </span>
                    </Link>
                </div>

                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="menu"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={styles.mobileLink}
                        onClick={() => setMenuOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}
                <div className={styles.mobileActions}>
                    <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setMenuOpen(false)}>
                        ورود
                    </Link>
                    <Link href="/quiz" className={styles.mobilePrimaryBtn} onClick={() => setMenuOpen(false)}>
                        شروع کن
                    </Link>
                </div>
            </div>
        </header>
    );
}
