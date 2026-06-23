"use client";

import Link from "next/link";
import {ArrowLeft, ArrowRight, Lock} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const sections = [
    {
        title: "۱. اطلاعاتی که جمع‌آوری می‌کنیم",
        text: "ما اطلاعاتی را که شما داوطلبانه در اختیار ما قرار می‌دهید جمع‌آوری می‌کنیم، از جمله: نام، سن، وزن، قد، هدف تناسب اندام، سطح فعالیت، عادات غذایی و اطلاعات ورزشی. این اطلاعات برای شخصی‌سازی برنامه‌های غذایی و ورزشی شما استفاده می‌شود.",
    },
    {
        title: "۲. نحوه استفاده از اطلاعات",
        text: "اطلاعات شما صرفاً برای ارائه خدمات زیر استفاده می‌شود: تولید برنامه غذایی و ورزشی اختصاصی، بهبود الگوریتم‌های شخصی‌سازی، ارتباط با شما در مورد خدمات و پشتیبانی، و تحلیل آماری داخلی (بدون شناسایی هویت فردی).",
    },
    {
        title: "۳. ذخیره‌سازی و امنیت",
        text: "اطلاعات شما با بالاترین استانداردهای امنیتی روی سرورهای امن ذخیره می‌شود. تمامی ارتباطات بین مرورگر شما و سرور ما با پروتکل HTTPS رمزنگاری می‌شود. ما از روش‌های رمزنگاری پیشرفته برای محافظت از داده‌های شما استفاده می‌کنیم.",
    },
    {
        title: "۴. اشتراک‌گذاری اطلاعات",
        text: "فیت‌بانو تحت هیچ شرایطی اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذارد، مگر در موارد قانونی و با حکم قضایی. اطلاعات جمع‌آوری شده هرگز به فروش نمی‌رسد.",
    },
    {
        title: "۵. کوکی‌ها",
        text: "ما از کوکی‌ها برای بهبود تجربه کاربری استفاده می‌کنیم. کوکی‌ها فایل‌های کوچکی هستند که در مرورگر شما ذخیره می‌شوند و به ما کمک می‌کنند شما را بشناسیم و خدمات بهتری ارائه دهیم. شما می‌توانید کوکی‌ها را در تنظیمات مرورگر خود مدیریت کنید.",
    },
    {
        title: "۶. حقوق شما",
        text: "شما حق دارید در هر زمان اطلاعات خود را مشاهده، ویرایش یا حذف کنید. می‌توانید از طریق داشبورد شخصی به اطلاعات خود دسترسی داشته باشید یا با پشتیبانی تماس بگیرید. همچنین می‌توانید در هر زمان درخواست حذف کامل حساب کاربری خود را بدهید.",
    },
    {
        title: "۷. تغییرات در حریم خصوصی",
        text: "فیت‌بانو ممکن است این سیاست را به‌روز کند. تغییرات در همین صفحه اعمال می‌شود و تاریخ آخرین به‌روزرسانی در بالای صفحه درج می‌گردد. ادامه استفاده از خدمات پس از تغییرات به معنای پذیرش سیاست جدید است.",
    },
];

export default function PrivacyPage() {
    return (
        <main className={styles.page}>
            <div className={styles.bgGlow} />
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroBadge}>
                    <Lock size={14} />
                    حریم خصوصی
                </div>
                <h1 className={styles.heroTitle}>حریم خصوصی در فیت‌بانو</h1>
                <p className={styles.heroDesc}>
                    حریم خصوصی شما برای ما اهمیت دارد. این سند توضیح می‌دهد چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم
                </p>
            </section>

            <section className={styles.content}>
                <div className={styles.card}>
                    {sections.map((sec, i) => (
                        <div key={i} className={styles.block}>
                            <h2 className={styles.blockTitle}>{sec.title}</h2>
                            <p className={styles.blockText}>{sec.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.cta}>
                <Link href="/quiz" className={styles.ctaBtn}>
                    شروع کنید
                    <ArrowLeft size={16} />
                </Link>
                <Link href="/rules" className={styles.secondaryBtn}>
                    قوانین و مقررات
                </Link>
            </section>

            <Footer />
        </main>
    );
}
