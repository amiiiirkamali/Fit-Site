import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "فیت‌بانو — برنامه‌ی شخصی‌سازی‌شده‌ی تناسب اندام",
    description: "برنامه‌ی غذایی و ورزشی اختصاصی، ساخته‌شده برای تو",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fa" dir="rtl">
        <body>{children}</body>
        </html>
    );
}
