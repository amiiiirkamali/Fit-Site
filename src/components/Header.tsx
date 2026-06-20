"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "صفحه اصلی", path: "/" },
    { label: "درباره ما", path: "/about" },
    { label: "وبلاگ", path: "/blog" },
    { label: "تماس با ما", path: "/contact" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo} onClick={() => router.push("/")}>
          فیت‌بانو
        </span>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navLink} ${pathname === item.path ? styles.navActive : ""}`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className={styles.loginBtn} onClick={() => router.push("/login")}>
          ورود
        </button>
      </div>
    </header>
  );
}
