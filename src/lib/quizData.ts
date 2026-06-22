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
    // === Section 0: Intro & Basics ===
    {
        type: "text",
        key: "name",
        title: "نام و نام خانوادگی",
        subtitle: "لطفاً نام و نام خانوادگی خود را وارد کنید",
        placeholder: "مثلاً سارا محمدی",
        section: 0,
    },
    {
        type: "single",
        key: "age",
        title: "سنت چنده؟",
        subtitle: "برای تنظیم برنامه متناسب با سنت",
        options: [
            { value: "18-23", label: "۱۸-۲۳" },
            { value: "24-29", label: "۲۴-۲۹" },
            { value: "30s", label: "۳۰-۳۹" },
            { value: "40s", label: "۴۰-۴۹" },
            { value: "50+", label: "۵۰+" },
        ],
        section: 0,
    },
    {
        type: "insight",
        key: "intro-promo-1",
        title: "به جمع میلیون‌ها نفر بپیوند!",
        insightText:
            "به بیش از ۳ میلیون نفر که با فیت‌بانو سلامتی و تناسب اندامشون رو بهتر می‌کنن بپیوند.",
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
        title: "زندگیم رو تغییر داد",
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
        title: "تو تنها نیستی! 🌿",
        insightText:
            "🌿 ۳۸٪ از افرادی که به فیت‌بانو می‌پیوندن، به تنهایی راحت‌اند ولی به دنبال راهنمایی بیشتری هستن.\n\nبیا نگاهی به نیازهای تمرینی فعلی‌ات بندازیم.",
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
        title: "چند وقت یک‌بار در ۳ ماه گذشته ورزش کرده‌ای؟",
        options: [
            { value: "several-week", label: "چند بار در هفته" },
            { value: "several-month", label: "چند بار در ماه" },
            { value: "once-twice", label: "یک یا دو بار" },
            { value: "never", label: "ورزش نمی‌کنم" },
        ],
        section: 1,
    },
    {
        type: "insight",
        key: "frequency-insight",
        title: "🎯 تو در مسیر درستی هستی",
        insightText:
            "خیلی از افراد با ندونستن اینکه چیکار کنن توی باشگاه دست‌وپنجه نرم می‌کنن.\n\nبیا ببینیم کدوم روش تمرینی برات بهترینه.",
        insightIcon: "🎯",
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
        type: "behavior",
        key: "behavior-profile",
        title: "🔥 دنبال‌کننده نقاط عطف",
        profileDescription:
            "تو وقتی پیشرفت رو می‌بینی که جمع میشه، شکوفا میشی. پیروزی‌های کوچک هر هفته انگیزه‌ت رو برای مرحله بعد تأمین می‌کنه.",
        nextSteps:
            "پیشرفتت رو برات برجسته می‌کنیم تا با انگیزه و مطمئن بمونی، یک نقطه عطف در هر زمان.",
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
        key: "workoutDuration",
        title: "چقدر دوست داری تمریناتت طول بکشه؟",
        options: [
            { value: "15", label: "۱۵ دقیقه" },
            { value: "30", label: "۳۰ دقیقه" },
            { value: "45", label: "۴۵ دقیقه" },
            { value: "60+", label: "+۶۰ دقیقه" },
        ],
        section: 2,
    },
    {
        type: "single",
        key: "workSchedule",
        title: "برنامه کاری‌ات چه شکلیه؟",
        options: [
            { value: "9-5", label: "🏢 ۹ تا ۵" },
            { value: "shift", label: "🌙 شیفتی" },
            { value: "flexible", label: "🔄 ساعت کاری منعطف" },
            { value: "retired", label: "🏖️ بازنشسته یا فعلاً شاغل نیستم" },
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
        type: "multiple",
        key: "otherTraining",
        title: "آیا نوع دیگه‌ای از تمرین هم انجام می‌دی؟",
        options: [
            { value: "none", label: "هیچکدام" },
            { value: "cardio", label: "کاردیو/استقامتی" },
            { value: "team", label: "ورزش‌های تیمی/توپی" },
            { value: "yoga", label: "یوگا/تحرک‌پذیری" },
            { value: "pilates", label: "پیلاتس" },
            { value: "other", label: "دیگر" },
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
        key: "trainingSplit",
        title: "آیا اسپلیت تمرینی ترجیحی داری؟",
        options: [
            { value: "push-pull-legs", label: "پوش/پول/لگ" },
            { value: "upper-lower", label: "بالاتنه/پایین‌تنه" },
            { value: "full-body", label: "تمام بدن" },
            { value: "not-sure", label: "مطمئن نیستم" },
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
        title: "نتیجه بهتر از یک مربی شخصی",
        quote:
            "بعد از چند ماه استفاده از فیت‌بانو نتیجه بهتری گرفتم تا یک سال و نیم با یک مربی شخصی، اون هم با هزینه‌ای بسیار کمتر. نمی‌تونم به اندازه کافی از این اپ تشکر کنم.",
        author: "مریم",
        rating: 5,
        section: 3,
    },
];

export const TOTAL_SECTIONS = 4;
