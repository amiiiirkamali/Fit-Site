"use client";

import Link from "next/link";
import {ArrowLeft, ArrowRight, Shield} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const sections = [
    {
        title: "۱. پذیرش قوانین",
        text: "با استفاده از وب‌سایت و اپلیکیشن فیت‌بانو، شما تمامی قوانین و مقررات زیر را پذیرفته‌اید. اگر با هر یک از این موارد موافق نیستید، لطفاً از سرویس‌های ما استفاده نکنید.",
    },
    {
        title: "۲. ثبت‌نام و حساب کاربری",
        text: "برای استفاده از برخی خدمات، نیاز به ثبت‌نام و ایجاد حساب کاربری دارید. شما مسئول حفظ محرمانه بودن اطلاعات حساب کاربری خود هستید. هرگونه فعالیتی که تحت حساب شما انجام شود، به عهده شماست.",
    },
    {
        title: "۳. اشتراک و پرداخت",
        text: "اشتراک فیت‌بانو به صورت ماهانه ارائه می‌شود. پس از پرداخت موفق، برنامه اختصاصی شما به مدت ۳۰ روز قابل دسترسی خواهد بود. مبلغ پرداختی به دلیل ارائه خدمات دیجیتال قابل استرداد نیست.",
    },
    {
        title: "۴. محتوای آموزشی",
        text: "تمامی برنامه‌های غذایی، ورزشی و محتوای آموزشی ارائه شده در فیت‌بانو صرفاً برای اهداف اطلاعاتی و آموزشی است. فیت‌بانو هیچ مسئولیتی در قبال نتایج حاصل از استفاده از این محتوا ندارد. توصیه می‌شود قبل از شروع هر برنامه ورزشی با پزشک خود مشورت کنید.",
    },
    {
        title: "۵. حقوق مالکیت فکری",
        text: "تمامی محتوای موجود در فیت‌بانو اعم از متن، تصویر، ویدئو، گیف و نرم‌افزار، متعلق به فیت‌بانو بوده و هرگونه کپی‌برداری، بازتولید یا توزیع بدون مجوز کتبی ممنوع است.",
    },
    {
        title: "۶. تغییرات در قوانین",
        text: "فیت‌بانو این حق را برای خود محفوظ می‌دارد که در هر زمان قوانین و مقررات را تغییر دهد. تغییرات در همین صفحه اعمال خواهد شد و ادامه استفاده از خدمات پس از تغییرات به معنای پذیرش قوانین جدید است.",
    },
];

export default function RulesPage() {
    return (
        <main className={styles.page}>
            <div className={styles.bgGlow} />
            <Header />

            <section className={styles.hero}>
                <div className={styles.heroBadge}>
                    <Shield size={14} />
                    قوانین و مقررات
                </div>
                <h1 className={styles.heroTitle}>قوانین استفاده از فیت‌بانو</h1>
                <p className={styles.heroDesc}>
                    لطفاً پیش از استفاده از خدمات، قوانین زیر را با دقت مطالعه کنید
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
                <Link href="/privacy" className={styles.secondaryBtn}>
                    حریم خصوصی
                </Link>
            </section>

            <Footer />
        </main>
    );
}
