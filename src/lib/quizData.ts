export interface QuizStep {
    type: "single" | "multiple" | "number" | "insight";
    key: string;
    title: string;
    subtitle?: string;
    options?: { value: string; label: string; icon?: string }[];
    placeholder?: string;
    unit?: string;
    min?: number;
    max?: number;
    insightText?: string;
    insightIcon?: string;
    section: number; // 0-3 for progress bar sections
}

export const quizSteps: QuizStep[] = [
    // === بخش ۱: اطلاعات پایه ===
    {
        type: "insight",
        key: "welcome",
        title: "به فیت‌بانو خوش اومدی! 🌸",
        insightText:
            "ما قراره با چند سوال ساده، یه برنامه‌ی غذایی و ورزشی کاملاً اختصاصی برای تو بسازیم. آماده‌ای؟",
        insightIcon: "🎯",
        section: 0,
    },
    {
        type: "single",
        key: "gender",
        title: "جنسیت شما",
        subtitle: "این برنامه مخصوص خانم‌ها طراحی شده",
        options: [
            { value: "female", label: "خانم", icon: "👩" },
        ],
        section: 0,
    },
    {
        type: "number",
        key: "age",
        title: "چند سالته؟",
        subtitle: "سن تو در محاسبه‌ی کالری و برنامه‌ریزی مهمه",
        placeholder: "مثلاً ۲۸",
        unit: "سال",
        min: 14,
        max: 70,
        section: 0,
    },
    {
        type: "number",
        key: "height",
        title: "قدت چقدره؟",
        placeholder: "مثلاً ۱۶۵",
        unit: "سانتی‌متر",
        min: 130,
        max: 210,
        section: 0,
    },
    {
        type: "number",
        key: "weight",
        title: "وزن فعلیت چنده؟",
        placeholder: "مثلاً ۶۵",
        unit: "کیلوگرم",
        min: 35,
        max: 200,
        section: 0,
    },
    {
        type: "number",
        key: "targetWeight",
        title: "وزن هدفت چنده؟",
        subtitle: "وزنی که دوست داری بهش برسی",
        placeholder: "مثلاً ۵۸",
        unit: "کیلوگرم",
        min: 35,
        max: 200,
        section: 0,
    },
    {
        type: "insight",
        key: "weight-insight",
        title: "چرا کاهش وزن تدریجی بهتره؟ 📉",
        insightText:
            "تحقیقات نشون میده که کاهش ۰.۵ تا ۱ کیلو در هفته، بهترین روش برای حفظ نتایج بلندمدته. ما برنامه‌ت رو بر همین اساس می‌سازیم.",
        insightIcon: "💡",
        section: 0,
    },

    // === بخش ۲: سبک زندگی ===
    {
        type: "single",
        key: "goal",
        title: "هدف اصلیت چیه؟",
        options: [
            { value: "lose", label: "کاهش وزن", icon: "⬇️" },
            { value: "gain", label: "افزایش وزن", icon: "⬆️" },
            { value: "maintain", label: "حفظ وزن و تناسب اندام", icon: "⚖️" },
            { value: "muscle", label: "عضله‌سازی", icon: "💪" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "activityLevel",
        title: "سطح فعالیت روزانه‌ت چقدره؟",
        subtitle: "فعالیت بدنی معمولت رو در نظر بگیر (بدون ورزش)",
        options: [
            { value: "sedentary", label: "کم‌تحرک (عمدتاً نشسته)", icon: "🪑" },
            { value: "light", label: "فعالیت سبک (پیاده‌روی کم)", icon: "🚶‍♀️" },
            { value: "moderate", label: "فعالیت متوسط", icon: "🏃‍♀️" },
            { value: "active", label: "خیلی فعال", icon: "⚡" },
            { value: "veryActive", label: "فوق‌العاده فعال (شغل فیزیکی)", icon: "🔥" },
        ],
        section: 1,
    },
    {
        type: "insight",
        key: "activity-insight",
        title: "فعالیت روزانه خیلی مهمه! 🏃‍♀️",
        insightText:
            "حتی بدون ورزش، میزان فعالیت روزانه‌ت (مثل پیاده‌روی، کار خانه) تأثیر زیادی روی کالری مصرفیت داره.",
        insightIcon: "📊",
        section: 1,
    },
    {
        type: "single",
        key: "fitnessLevel",
        title: "سابقه‌ی ورزشیت چطوره؟",
        options: [
            { value: "beginner", label: "مبتدی (تازه شروع کردم)", icon: "🌱" },
            { value: "intermediate", label: "متوسط (۳-۶ ماه تجربه)", icon: "🌿" },
            { value: "advanced", label: "پیشرفته (بیش از ۱ سال)", icon: "🌳" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "workoutDays",
        title: "هفته‌ای چند روز می‌تونی ورزش کنی؟",
        options: [
            { value: "2", label: "۲ روز", icon: "2️⃣" },
            { value: "3", label: "۳ روز", icon: "3️⃣" },
            { value: "4", label: "۴ روز", icon: "4️⃣" },
            { value: "5", label: "۵ روز", icon: "5️⃣" },
            { value: "6", label: "۶ روز", icon: "6️⃣" },
        ],
        section: 1,
    },

    // === بخش ۳: تجهیزات و محدودیت‌ها ===
    {
        type: "single",
        key: "equipment",
        title: "کجا ورزش می‌کنی؟",
        options: [
            { value: "none", label: "خونه (بدون تجهیزات)", icon: "🏠" },
            { value: "home-basic", label: "خونه (با دمبل/کش)", icon: "🏡" },
            { value: "gym", label: "باشگاه", icon: "🏋️‍♀️" },
        ],
        section: 2,
    },
    {
        type: "insight",
        key: "equipment-insight",
        title: "نگران نباش! 💪",
        insightText:
            "حتی بدون هیچ تجهیزاتی، با وزن بدنت می‌تونی تمرینات فوق‌العاده مؤثری انجام بدی. ما برنامه رو متناسب با امکاناتت می‌سازیم.",
        insightIcon: "✨",
        section: 2,
    },
    {
        type: "multiple",
        key: "dietaryRestrictions",
        title: "محدودیت غذایی داری؟",
        subtitle: "هر چند تا که هست انتخاب کن (اختیاری)",
        options: [
            { value: "none", label: "ندارم", icon: "✅" },
            { value: "وگان", label: "وگان / گیاهخوار", icon: "🥬" },
            { value: "بدون‌گلوتن", label: "بدون گلوتن", icon: "🌾" },
            { value: "بدون‌لبنیات", label: "بدون لبنیات", icon: "🥛" },
            { value: "دیابت", label: "دیابتی", icon: "💉" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "waterIntake",
        title: "روزانه چقدر آب می‌خوری؟",
        options: [
            { value: "low", label: "کمتر از ۴ لیوان", icon: "💧" },
            { value: "medium", label: "۴ تا ۸ لیوان", icon: "💧💧" },
            { value: "high", label: "بیشتر از ۸ لیوان", icon: "💧💧💧" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "sleepHours",
        title: "شبا معمولاً چند ساعت می‌خوابی؟",
        options: [
            { value: "less5", label: "کمتر از ۵ ساعت", icon: "😴" },
            { value: "5to7", label: "۵ تا ۷ ساعت", icon: "😊" },
            { value: "7to9", label: "۷ تا ۹ ساعت", icon: "😄" },
            { value: "more9", label: "بیشتر از ۹ ساعت", icon: "🥱" },
        ],
        section: 2,
    },

    // === بخش ۴: ترجیحات نهایی ===
    {
        type: "insight",
        key: "sleep-insight",
        title: "خواب کافی = نتیجه‌ی بهتر! 🌙",
        insightText:
            "مطالعات نشون میده که خواب ناکافی باعث افزایش هورمون گرسنگی و کاهش سوخت‌وساز میشه. سعی کن ۷-۸ ساعت بخوابی.",
        insightIcon: "🌙",
        section: 3,
    },
    {
        type: "single",
        key: "mealCount",
        title: "ترجیح میدی روزی چند وعده بخوری؟",
        options: [
            { value: "3", label: "۳ وعده اصلی", icon: "🍽️" },
            { value: "4", label: "۳ وعده + ۱ میان‌وعده", icon: "🍽️🍎" },
            { value: "5", label: "۳ وعده + ۲ میان‌وعده", icon: "🍽️🍎🍎" },
        ],
        section: 3,
    },
    {
        type: "single",
        key: "cookingTime",
        title: "معمولاً چقدر وقت برای آشپزی داری؟",
        options: [
            { value: "minimal", label: "خیلی کم (زیر ۳۰ دقیقه)", icon: "⚡" },
            { value: "moderate", label: "متوسط (۳۰-۶۰ دقیقه)", icon: "🕐" },
            { value: "plenty", label: "زیاد (بیش از ۱ ساعت)", icon: "👩‍🍳" },
        ],
        section: 3,
    },
    {
        type: "single",
        key: "motivation",
        title: "انگیزه‌ی اصلیت برای این تغییر چیه؟",
        options: [
            { value: "health", label: "سلامتی و انرژی بیشتر", icon: "❤️" },
            { value: "appearance", label: "ظاهر و اعتماد به نفس", icon: "✨" },
            { value: "fitness", label: "آمادگی جسمانی", icon: "🏃‍♀️" },
            { value: "medical", label: "توصیه‌ی پزشک", icon: "🩺" },
        ],
        section: 3,
    },
    {
        type: "insight",
        key: "final-insight",
        title: "عالیه! داریم برنامه‌ت رو آماده می‌کنیم 🎉",
        insightText:
            "بر اساس اطلاعاتی که دادی، ما یه برنامه‌ی کاملاً شخصی‌سازی‌شده برات می‌سازیم. فقط شماره موبایلت رو وارد کن تا برنامه رو بتونی همیشه ببینی.",
        insightIcon: "🚀",
        section: 3,
    },
];

export const TOTAL_SECTIONS = 4;