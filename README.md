# 🌸 Fitsite — برنامه کاهش وزن و سلامتی برای خانم‌ها

> **تبدیل سبک زندگی، نه فقط کاهش وزن.**  
> برنامه‌های غذایی و تمرینی شخصی‌سازی‌شده، طراحی‌شده خصوصاً برای بدن و نیازهای زنان.

---

## ✨ خدمات

| خدمت | توضیح |
|------|--------|
| 🥗 **برنامه غذایی** | رژیم متناسب با هدف، سبک زندگی و ذائقه شما |
| 🏋️‍♀️ **برنامه تمرینی** | تمرین‌های خانگی و باشگاهی مخصوص خانم‌ها |

---

## 🛠️ تکنولوژی‌ها

- **Framework:** [Next.js 16](https://nextjs.org/) با App Router
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Linter:** ESLint
- **Package Manager:** npm

---

## 🚀 راه‌اندازی پروژه

### پیش‌نیازها

- Node.js نسخه ۱۸ یا بالاتر
- npm

### نصب و اجرا

```bash
# کلون کردن پروژه
git clone https://github.com/your-username/fitsite.git
cd fitsite

# نصب پکیج‌ها
npm install

# اجرا در حالت development
npm run dev
```

سایت روی [http://localhost:3000](http://localhost:3000) بالا میاد.

---

## 📁 ساختار پروژه

```
fitsite/
├── src/
│   └── app/
│       ├── layout.tsx          # Layout اصلی
│       ├── page.tsx            # صفحه اصلی
│       ├── about/              # درباره ما
│       ├── services/
│       │   ├── diet-plan/      # برنامه غذایی
│       │   └── workout-plan/   # برنامه تمرینی
│       ├── blog/               # مقالات
│       ├── pricing/            # قیمت‌ها
│       └── contact/            # تماس با ما
│
├── src/components/
│   ├── layout/                 # Header, Footer, Navbar
│   ├── home/                   # کامپوننت‌های صفحه اصلی
│   ├── services/               # کامپوننت‌های خدمات
│   └── ui/                     # کامپوننت‌های مشترک
│
├── public/                     # فایل‌های استاتیک
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 📜 اسکریپت‌ها

```bash
npm run dev        # اجرای سرور توسعه
npm run build      # بیلد برای production
npm run start      # اجرای نسخه production
npm run lint       # بررسی کد با ESLint
```

---

## 🌿 محیط‌های مختلف

| فایل | کاربرد |
|------|---------|
| `.env.local` | متغیرهای محلی (گیت ایگنور شده) |
| `.env.development` | تنظیمات development |
| `.env.production` | تنظیمات production |

---

## 🤝 مشارکت در پروژه

1. یه fork بگیر
2. یه branch جدید بساز: `git checkout -b feature/feature-name`
3. تغییراتت رو commit کن: `git commit -m 'feat: add new feature'`
4. push کن: `git push origin feature/feature-name`
5. یه Pull Request باز کن

---

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده — برای جزئیات فایل [LICENSE](LICENSE) رو ببین.

---

<div align="center">
  ساخته شده با ❤️ برای سلامتی زنان ایران
</div>