export interface QuizStep {
    type: "single" | "multiple" | "number" | "text" | "insight" | "testimonial" | "behavior";
    key: string;
    title: string;
    subtitle?: string;
    options?: { value: string; label: string; icon?: string }[];
    placeholder?: string;
    unit?: string;
    min?: number;
    max?: number;
    section: number;
    // For insight
    insightText?: string;
    insightIcon?: string;
    // For testimonial
    quote?: string;
    author?: string;
    rating?: number;
    // For behavior
    profileDescription?: string;
    nextSteps?: string;
}

export const quizSteps: QuizStep[] = [
    {
        type: "number",
        key: "age",
        title: "چند سالته؟",
        subtitle: "برای تنظیم برنامه متناسب با سنت",
        placeholder: "مثلاً ۲۵",
        unit: "سال",
        min: 10,
        max: 100,
        section: 2,
    },
    {
        type: "number",
        key: "weight",
        title: "چند کیلویی؟",
        subtitle: "برای محاسبه برنامه دقیق",
        placeholder: "مثلاً ۶۵",
        unit: "کیلوگرم",
        min: 30,
        max: 250,
        section: 2,
    },
    {
        type: "number",
        key: "height",
        title: "قدت چقدره؟",
        subtitle: "برای تنظیم برنامه متناسب با قدت",
        placeholder: "مثلاً ۱۶۵",
        unit: "سانتی‌متر",
        min: 100,
        max: 230,
        section: 2,
    },
    {
        type: "number",
        key: "targetWeight",
        title: "به چه وزنی می‌خوای برسی؟",
        subtitle: "هدف خودت رو مشخص کن",
        placeholder: "مثلاً ۵۵",
        unit: "کیلوگرم",
        min: 25,
        max: 250,
        section: 2,
    },
    {
        type: "insight",
        key: "intro-promo-1",
        title: "به جمع هزاران نفر بپیوند!",
        insightText:
            "به بیش از 40 هزار نفر که با فیت‌بانو سلامتی و تناسب اندامشون رو بهتر می‌کنن بپیوند.",
        insightIcon: "💪",
        section: 0,
    },
    {
        type: "single",
        key: "goal",
        title: "هدف اصلیت چیه؟",
        options: [
            { value: "muscle", label: "عضله‌سازی" },
            { value: "lose", label: "کاهش وزن" },
            { value: "recomposition", label: "کاهش چربی و عضله‌سازی" },
            { value: "overall-fitness", label: "بهبود تناسب اندام کلی" },
        ],
        section: 0,
    },
    {
        type: "insight",
        key: "intro-promo-2",
        title: "با فیت‌بانو در مسیر سلامتی",
        insightText:
            "فیت‌بانو به بیش از ۳ میلیون نفر کمک کرده سالم و فیت بمونن. با برنامه‌های تمرینی هوشمند و شخصی‌سازی‌شده، تو هم می‌تونی به نتیجه برسی.",
        insightIcon: "🏋️‍♀️",
        section: 0,
    },
    {
        type: "testimonial",
        key: "testimonial-1",
        title: "فیت سینک عاشقتم",
        quote:
            "مدت زیادی از فیت‌بانو استفاده می‌کنم، عالیه و واقعاً به فیت ماندن و رشد عضلانیم کمک می‌کنه! به لطف اون، ۳۲ کیلو وزن کم کردم و عضله زیادی به دست آوردم، در عرض ۱.۵ سال با ۳ تمرین در هفته.",
        author: "پریسا",
        rating: 5,
        section: 0,
    },
    {
        type: "single",
        key: "experience",
        title: "چقدر در تمرینات قدرتی تجربه داری؟",
        options: [
            { value: "beginner", label: "🌱 تازه شروع کردم" },
            { value: "comfortable", label: "🌿 به تنهایی راحتم، ولی متخصص نیستم" },
            { value: "experienced", label: "🪴 با تجربه‌ام" },
        ],
        section: 0,
    },

    // === Section 1: Challenges & Motivation ===
    {
        type: "insight",
        key: "experience-insight",
        title: "تو تنها نیستی!",
        insightText:
            "۳۸٪ از افرادی که از فیت‌بانو برنامه میگیرن،قبل از ما نتونستن به نتیجه دلخواهشون برسن و سرد شده بودن یا کلا ورزش رو گذاشته بودن کنار.",
        insightIcon: "🌿",
        section: 1,
    },
    {
        type: "single",
        key: "challenge",
        title: "بزرگ‌ترین چالش در رسیدن به اهدافت چی بوده؟",
        options: [
            { value: "motivation", label: "😴 کمبود انگیزه" },
            { value: "knowledge", label: "❓ ندونستن چیکار کنم" },
            { value: "busy", label: "📅 برنامه شلوغ" },
            { value: "none", label: "❌ هیچکدوم از موارد بالا" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "frequency",
        title: "در ۳ ماه گذشته چقدر ورزش کردی؟",
        options: [
            { value: "once-twice", label: "یک یا دو بار" },
            { value: "several-week", label: "چند بار در هفته" },
            { value: "several-month", label: "چند بار در ماه" },
            { value: "never", label: "ورزش نکردم" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "progress_motivation",
        title: "دیدن پیشرفتم هر هفته باعث میشه با انگیزه بمونم.",
        options: [
            { value: "agree", label: "موافقم" },
            { value: "disagree", label: "مخالفم" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "challenge_workouts",
        title: "عاشق اینم که تمریناتم هر بار چالش‌برانگیزتر بشن.",
        options: [
            { value: "agree", label: "موافقم" },
            { value: "disagree", label: "مخالفم" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "boring_repetition",
        title: "تکرار تمرینات یکسان زود خسته‌کننده میشه.",
        options: [
            { value: "agree", label: "موافقم" },
            { value: "disagree", label: "مخالفم" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "form_guidance",
        title: "راهنمایی واضح برای فرم حرکات باعث میشه در باشگاه احساس اعتمادبه‌نفس کنم.",
        options: [
            { value: "agree", label: "موافقم" },
            { value: "disagree", label: "مخالفم" },
        ],
        section: 1,
    },
    {
        type: "single",
        key: "bodyType",
        title: "فرم بدنیت کدومه؟",
        options: [
            { value: "thin", label: "لاغر" },
            { value: "fat", label: "چاق" },
            { value: "very-fat", label: "خیلی چاق" },
        ],
        section: 1,
    },
    {
        type: "behavior",
        key: "behavior-profile",
        title: "خوشحالم که میخوای سبک زندگیت رو تغییر بدی",
        profileDescription:
            "تا اینجا 65% احتمالا میتونم کمکت کنم چون به +4500 نفر  با مشخصات شبیه به تو کمک کردم ولی اگه میخوای میتونم کمکت کنم یا نه باید x سوال بیشتر جواب بدی تا بهت بگم.",
        section: 1,
    },

    // === Section 2: Schedule & Equipment ===
    {
        type: "single",
        key: "workoutDays",
        title: "چند روز در هفته می‌خوای ورزش کنی؟",
        options: [
            { value: "2", label: "۲ روز" },
            { value: "3", label: "۳ روز" },
            { value: "4", label: "۴ روز" },
            { value: "5", label: "۵ روز" },
            { value: "6", label: "۶ روز" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "dailyActivity",
        title: "فعالیت روزانه‌ات چه شکلیه؟",
        options: [
            { value: "sedentary", label: "🪑 بیشتر نشسته" },
            { value: "standing", label: "🚶 دائماً سرپا" },
            { value: "mixed", label: "⚖️ ترکیبی از نشستن و حرکت/ایستادن" },
            { value: "varies", label: "🔄 روز به روز فرق می‌کنه" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "sleep",
        title: "معمولاً چقدر می‌خوابی؟",
        options: [
            { value: "less5", label: "کمتر از ۵ ساعت" },
            { value: "5-6", label: "۵-۶ ساعت" },
            { value: "7-8", label: "۷-۸ ساعت" },
            { value: "more8", label: "بیشتر از ۸ ساعت" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "workoutPlace",
        title: "کجا تمرین میکنی؟",
        options: [
            { value: "home", label: "خونه" },
            { value: "gym", label: "باشگاه" },
        ],
        section: 2,
    },
    {
        type: "multiple",
        key: "equipment",
        title: "چه تجهیزاتی در دسترس داری؟",
        options: [
            { value: "dumbbell", label: "دمبل یا کتل‌بل" },
            { value: "barbell", label: "هالتر (بدنبیلدینگ)" },
            { value: "machine", label: "دستگاه یا کابل" },
            { value: "band", label: "کش‌های تمرینی" },
            { value: "bench", label: "نیمکت" },
        ],
        section: 2,
    },
    {
        type: "insight",
        key: "equipment-promo",
        title: "با هر وسیله‌ای که هست، شروع کن!",
        insightText:
            "حرکت‌های جدید رو امتحان کن و پیشرفت بیشتری ببین، فقط با تجهیزاتی که در دسترس داری.",
        insightIcon: "🏋️‍♀️",
        section: 2,
    },
    {
        type: "testimonial",
        key: "testimonial-2",
        title: "من رو در مسیر نگه می‌داره",
        quote:
            "فیت‌بانو یک ساله که برنامه اصلی منه. توانایی‌ش در تغییر آسون بر اساس تجهیزات موجود، محدودیت زمانی و تمرکز روی گروه‌های عضلانی عالی بوده. همراه من بوده توی باشگاه هتل، خونه، موقع اسباب‌کشی، دیدن خانواده و همه جا. فیت‌بانو من رو در مسیر و قوی‌تر شدن نگه داشته.",
        author: "زهرا",
        rating: 5,
        section: 2,
    },

    // === Section 3: Final Preferences ===
    {
        type: "single",
        key: "focusArea",
        title: "مرکز میخوای روی کدوم بخش بدنت باشه؟",
        options: [
            { value: "arms", label: "بازو" },
            { value: "abs", label: "شکم" },
            { value: "glutes", label: "باسن" },
            { value: "thighs", label: "ران" },
        ],
        section: 3,
    },
    {
        type: "single",
        key: "bestShape",
        title: "وقتی در بهترین فرم بدنی‌ام هستم، خودم رو این‌طوری می‌بینم:",
        options: [
            { value: "heavier", label: "وزنه بیشتری بزنم نسبت به همیشه" },
            { value: "comfortable", label: "احساس راحتی در پوست خودم" },
            { value: "keep-up", label: "همراهی با افراد جوون‌تر از خودم" },
            { value: "new-things", label: "کارهایی که قبلاً از نظر جسمی نمی‌توانستم انجام بدم" },
            { value: "habit", label: "سرانجام عادتی بسازم که واقعاً دوام بیاره" },
        ],
        section: 3,
    },
    {
        type: "testimonial",
        key: "testimonial-3",
        title: "خیلی بهتر شد",
        quote:
            ".با سوالای بیشتری که جواب دادی خیلی بیشتر شناختمت و الان حداقل 93% میتونم کمکت کنم.",
        rating: 5,
        section: 3,
    },
];

export const TOTAL_SECTIONS = 4;
