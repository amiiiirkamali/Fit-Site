import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.dietPlanItem.deleteMany();
    await prisma.workoutPlanItem.deleteMany();
    await prisma.dietPlan.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.quizAnswer.deleteMany();
    await prisma.exerciseItem.deleteMany();
    await prisma.foodItem.deleteMany();

    const foods = [
        { name: "نیمرو با نان سبوس‌دار", calories: 350, protein: 18, carbs: 30, fat: 16, mealType: "breakfast", dietaryTags: ["عادی"], description: "نیمرو با ۲ تخم‌مرغ و نان سبوس‌دار" },
        { name: "اسموتی موز و بادام", calories: 280, protein: 8, carbs: 40, fat: 10, mealType: "breakfast", dietaryTags: ["وگان", "بدون‌گلوتن"], description: "اسموتی با موز، شیر بادام و عسل" },
        { name: "جو دوسر با میوه", calories: 300, protein: 10, carbs: 50, fat: 6, mealType: "breakfast", dietaryTags: ["وگان"], description: "جو دوسر پخته با توت‌فرنگی و عسل" },
        { name: "پنیر و گردو با نان", calories: 320, protein: 14, carbs: 28, fat: 18, mealType: "breakfast", dietaryTags: ["عادی"], description: "پنیر تازه با گردو و نان تازه" },
        { name: "املت سبزیجات", calories: 290, protein: 16, carbs: 15, fat: 18, mealType: "breakfast", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "املت با گوجه، فلفل و پیاز" },

        { name: "سینه مرغ گریل با برنج", calories: 520, protein: 40, carbs: 55, fat: 12, mealType: "lunch", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "سینه مرغ گریل شده با برنج قهوه‌ای" },
        { name: "سالاد سزار با مرغ", calories: 420, protein: 32, carbs: 20, fat: 24, mealType: "lunch", dietaryTags: ["عادی"], description: "سالاد سزار با سینه مرغ گریل شده" },
        { name: "خوراک لوبیا با برنج", calories: 480, protein: 22, carbs: 65, fat: 14, mealType: "lunch", dietaryTags: ["وگان"], description: "خوراک لوبیا چیتی با برنج سفید" },
        { name: "ماهی سالمون با سبزیجات", calories: 450, protein: 35, carbs: 20, fat: 25, mealType: "lunch", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "فیله سالمون با سبزیجات بخارپز" },
        { name: "پاستا با سس گوجه و مرغ", calories: 550, protein: 30, carbs: 65, fat: 16, mealType: "lunch", dietaryTags: ["عادی"], description: "پاستا پنه با سس مارینارا و مرغ ریش‌شده" },

        { name: "سوپ جو با مرغ", calories: 280, protein: 18, carbs: 35, fat: 8, mealType: "dinner", dietaryTags: ["عادی"], description: "سوپ جو سنتی با تکه‌های مرغ" },
        { name: "سالاد یونانی با پنیر فتا", calories: 300, protein: 12, carbs: 18, fat: 20, mealType: "dinner", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "سالاد یونانی با خیار، گوجه و پنیر فتا" },
        { name: "کوفته تبریزی", calories: 420, protein: 25, carbs: 30, fat: 22, mealType: "dinner", dietaryTags: ["عادی"], description: "کوفته تبریزی با سس گوجه" },
        { name: "مرغ و سبزیجات بخارپز", calories: 350, protein: 30, carbs: 22, fat: 15, mealType: "dinner", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "سینه مرغ بخارپز با بروکلی و هویج" },
        { name: "عدس‌پلو", calories: 400, protein: 18, carbs: 60, fat: 10, mealType: "dinner", dietaryTags: ["وگان"], description: "عدس‌پلو با پیاز داغ" },

        { name: "میوه فصل", calories: 100, protein: 1, carbs: 24, fat: 0.5, mealType: "snack", dietaryTags: ["وگان", "بدون‌گلوتن"], description: "یک سهم میوه فصل" },
        { name: "ماست یونانی با عسل", calories: 150, protein: 12, carbs: 18, fat: 4, mealType: "snack", dietaryTags: ["عادی", "بدون‌گلوتن"], description: "ماست یونانی با یک قاشق عسل" },
        { name: "مغزیجات مخلوط", calories: 180, protein: 6, carbs: 8, fat: 16, mealType: "snack", dietaryTags: ["وگان", "بدون‌گلوتن"], description: "مخلوط بادام، گردو و فندق" },
        { name: "پروتئین بار", calories: 200, protein: 20, carbs: 22, fat: 6, mealType: "snack", dietaryTags: ["عادی"], description: "پروتئین بار شکلاتی" },
        { name: "هویج و هوموس", calories: 130, protein: 4, carbs: 16, fat: 6, mealType: "snack", dietaryTags: ["وگان", "بدون‌گلوتن"], description: "استیک هویج با هوموس" }
    ];

    const exercises = [
        // ─── Cardio / Warm-up ───
        { name: "پرش ستاره‌ای (جامپینگ جک)", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۳۰ ثانیه", description: "پرش همزمان دست و پا به طرفین" },
        { name: "زانو بلند (های نی)", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۳۰ ثانیه", description: "دویدن درجا با بالا آوردن زانوها" },
        { name: "پرش اسکوات", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "اسکوات همراه با پرش به بالا" },
        { name: "برپی", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "پیشرفته", sets: 3, reps: "۸-۱۰", description: "حرکت ترکیبی تمام بدن" },
        { name: "پرش لانج", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "لانج همراه با پرش و تعویض پا" },
        { name: "دویدن درجا", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۴۵ ثانیه", description: "دویدن آرام درجا برای گرم کردن" },
        { name: "کوهنورد (مانتین کلایمبر)", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۳۰ ثانیه", description: "حرکت کوهنورد در حالت شنا" },
        { name: "طناب زدن", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۳۰ ثانیه", description: "طناب زدن سریع" },
        { name: "کرانچ دوچرخه", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "حرکت دوچرخه برای شکم و کاردیو" },
        { name: "بورپی (مدل ساده)", muscleGroup: "کاردیو", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۸", description: "برپی ساده بدون پرش" },

        // ─── Home: Chest ───
        { name: "پوش‌آپ (شنا)", muscleGroup: "سینه", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۰-۱۲", description: "شنا روی زمین" },
        { name: "پرس سینه با دمبل", muscleGroup: "سینه", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "پرس سینه روی نیمکت با دمبل" },
        { name: "پوش‌آپ پا بالا", muscleGroup: "سینه", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۸-۱۰", description: "شنا با پاها روی نیمکت" },
        { name: "پوش‌آپ جمع", muscleGroup: "سینه", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۸-۱۰", description: "شنا با دست‌های جمع (زیر سینه)" },

        // ─── Home: Shoulders ───
        { name: "نشر از جلو با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "۱۲-۱۵", description: "نشر از جلو برای شانه قدامی" },
        { name: "نشر از بغل با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "۱۲-۱۵", description: "نشر جانبی برای شانه میانی" },
        { name: "نشر خمیده با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲-۱۵", description: "نشر خمیده برای شانه خلفی" },
        { name: "پرس شانه با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۰-۱۲", description: "پرس شانه با دمبل روی نیمکت" },

        // ─── Home: Arms ───
        { name: "جلو بازو با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "کرل جلو بازو با دمبل" },
        { name: "پشت بازو با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "اکستنشن پشت بازو" },
        { name: "جلو بازو چکشی با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "چکشی جلو بازو با دمبل" },
        { name: "پشت بازو خوابیده با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "پشت بازو خوابیده با دو دمبل" },

        // ─── Home: Back ───
        { name: "زیربغل با دمبل", muscleGroup: "پشت", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "رویینگ دمبل تک‌دست" },
        { name: "سوپرمن", muscleGroup: "پشت", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "حرکت سوپرمن برای تقویت کمر" },
        { name: "زیربغل خمیده با دمبل", muscleGroup: "پشت", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "رویینگ خمیده با دو دمبل" },
        { name: "پلانک لمسی شانه", muscleGroup: "پشت", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "پلانک با touch شانه" },

        // ─── Home: Legs & Glutes ───
        { name: "اسکوات بدون وزنه", muscleGroup: "پا", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "اسکوات با وزن بدن" },
        { name: "اسکوات با دمبل", muscleGroup: "پا", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "اسکوات گابلت با دمبل" },
        { name: "لانج جلو", muscleGroup: "پا", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۲ هر پا", description: "لانج جلو با وزن بدن" },
        { name: "لانج با دمبل", muscleGroup: "پا", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۰ هر پا", description: "لانج جلو با دمبل" },
        { name: "ددلیفت رومانیایی با دمبل", muscleGroup: "همسترینگ", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "ددلیفت رومانیایی با دمبل" },
        { name: "هیپ تراست", muscleGroup: "باسن", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "گلوت بریج / هیپ تراست" },
        { name: "هیپ تراست با دمبل", muscleGroup: "باسن", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "هیپ تراست با دمبل روی زمین" },
        { name: "ساق پا ایستاده", muscleGroup: "ساق", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۲۰", description: "بلند شدن روی پنجه پا" },
        { name: "اسکوات سومو با دمبل", muscleGroup: "پا", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "اسکوات سومو با یک دمبل" },
        { name: "لانج معکوس", muscleGroup: "پا", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۲ هر پا", description: "لانج به عقب" },

        // ─── Home: Abs ───
        { name: "پلانک", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۳۰ ثانیه", description: "پلانک ساعد" },
        { name: "کرانچ شکم", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۵-۲۰", description: "کرانچ سنتی" },
        { name: "پلانک پهلو", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۲۰ ثانیه", description: "پلانک پهلو برای عضلات مورب" },
        { name: "کرانچ معکوس", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "بالا بردن پاها در حالت خوابیده" },

        // ─── Gym: Chest ───
        { name: "پرس سینه هالتر", muscleGroup: "سینه", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "پرس سینه با هالتر روی نیمکت" },
        { name: "پرس سینه بالا با هالتر", muscleGroup: "سینه", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "پرس سینه بالا با هالتر روی نیمکت ۳۰ درجه" },
        { name: "پرس سینه دستگاه", muscleGroup: "سینه", equipment: "دستگاه", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "پرس سینه با دستگاه" },
        { name: "کراس اوور کابل", muscleGroup: "سینه", equipment: "کابل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "کراس اوور سینه با کابل" },

        // ─── Gym: Shoulders ───
        { name: "پرس شانه هالتر نشسته", muscleGroup: "شانه", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "پرس شانه با هالتر روی نیمکت" },
        { name: "نشر از بغل کابل", muscleGroup: "شانه", equipment: "کابل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "نشر جانبی با کابل" },
        { name: "نشر از جلو هالتر", muscleGroup: "شانه", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "نشر از جلو با هالتر" },
        { name: "آرنولد پرس", muscleGroup: "شانه", equipment: "دمبل", difficulty: "پیشرفته", sets: 3, reps: "۱۰", description: "آرنولد پرس روی نیمکت" },

        // ─── Gym: Arms ───
        { name: "جلو بازو هالتر", muscleGroup: "بازو", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "جلو بازو با هالتر صاف" },
        { name: "جلو بازو کابل", muscleGroup: "بازو", equipment: "کابل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "جلو بازو با کابل" },
        { name: "پشت بازو کابل", muscleGroup: "بازو", equipment: "کابل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "پشت بازو با کابل" },
        { name: "پشت بازو هالتر خوابیده", muscleGroup: "بازو", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "پشت بازو خوابیده با هالتر EZ" },

        // ─── Gym: Back ───
        { name: "زیربغل هالتر خمیده", muscleGroup: "پشت", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "رویینگ با هالتر خمیده" },
        { name: "زیربغل سیمکش دست باز", muscleGroup: "پشت", equipment: "کابل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "لات پول‌داون با کابل دست باز" },
        { name: "زیربغل سیمکش دست جمع", muscleGroup: "پشت", equipment: "کابل", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "لات پول‌داون با کابل دست جمع" },
        { name: "ددلیفت هالتر", muscleGroup: "پشت", equipment: "هالتر", difficulty: "پیشرفته", sets: 3, reps: "۸", description: "ددلیفت با هالتر" },
        { name: "زیربغل تی‌بار", muscleGroup: "پشت", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "زیربغل تی‌بار با هالتر و دستگیره" },

        // ─── Gym: Legs & Glutes ───
        { name: "اسکوات هالتر (اسکوات کلاسیک)", muscleGroup: "پا", equipment: "هالتر", difficulty: "پیشرفته", sets: 3, reps: "۱۰", description: "اسکوات با هالتر پشت" },
        { name: "لگ پرس دستگاه", muscleGroup: "پا", equipment: "دستگاه", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "لگ پرس با دستگاه" },
        { name: "هاک اسکوات", muscleGroup: "پا", equipment: "دستگاه", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "هاک اسکوات دستگاه" },
        { name: "ددلیفت رومانیایی هالتر", muscleGroup: "همسترینگ", equipment: "هالتر", difficulty: "متوسط", sets: 3, reps: "۱۰", description: "ددلیفت رومانیایی با هالتر" },
        { name: "باسن پرس دستگاه", muscleGroup: "باسن", equipment: "دستگاه", difficulty: "مبتدی", sets: 3, reps: "۱۲", description: "باسن پرس با دستگاه" },
        { name: "فیله کابل", muscleGroup: "همسترینگ", equipment: "کابل", difficulty: "متوسط", sets: 3, reps: "۱۲", description: "لیفت پا با کابل مچ پا" },
        { name: "ساق پا دستگاه نشسته", muscleGroup: "ساق", equipment: "دستگاه", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "ساق پا با دستگاه نشسته" },
        { name: "لانج هالتر", muscleGroup: "پا", equipment: "هالتر", difficulty: "پیشرفته", sets: 3, reps: "۸ هر پا", description: "لانج جلو با هالتر" },

        // ─── Gym: Abs ───
        { name: "کرانچ دستگاه", muscleGroup: "شکم", equipment: "دستگاه", difficulty: "مبتدی", sets: 3, reps: "۱۵", description: "کرانچ با دستگاه شکم" },
        { name: "پلانک روی نیمکت", muscleGroup: "شکم", equipment: "نیمکت", difficulty: "مبتدی", sets: 3, reps: "۳۰ ثانیه", description: "پلانک ساعد روی نیمکت" },
        { name: "آویزان شکم", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "پیشرفته", sets: 3, reps: "۱۰", description: "بالا آوردن پاها در حالت آویزان از بار" },
    ];

    await prisma.foodItem.createMany({ data: foods });
    await prisma.exerciseItem.createMany({ data: exercises });

    console.log("✅ Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });