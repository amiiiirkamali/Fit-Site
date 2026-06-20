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
        { name: "پوش‌آپ (شنا)", muscleGroup: "سینه", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "10-12", description: "شنا روی زمین" },
        { name: "پرس سینه با دمبل", muscleGroup: "سینه", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "12", description: "پرس سینه روی نیمکت با دمبل" },
        { name: "نشر از جلو با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "12-15", description: "نشر از جلو برای شانه‌ی قدامی" },
        { name: "نشر از بغل با دمبل", muscleGroup: "شانه", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "12-15", description: "نشر جانبی برای شانه‌ی میانی" },
        { name: "جلو بازو با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "12", description: "کرل جلو بازو با دمبل" },
        { name: "پشت بازو با دمبل", muscleGroup: "بازو", equipment: "دمبل", difficulty: "مبتدی", sets: 3, reps: "12", description: "اکستنشن پشت بازو" },
        { name: "زیربغل با دمبل", muscleGroup: "پشت", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "12", description: "رویینگ دمبل تک‌دست" },
        { name: "پلانک", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "30 ثانیه", description: "پلانک ساعد" },
        { name: "اسکوات بدون وزنه", muscleGroup: "پا", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "15", description: "اسکوات با وزن بدن" },
        { name: "اسکوات با دمبل", muscleGroup: "پا", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "12", description: "اسکوات گابلت با دمبل" },
        { name: "لانج جلو", muscleGroup: "پا", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "12 هر پا", description: "لانج جلو با وزن بدن" },
        { name: "ددلیفت رومانیایی با دمبل", muscleGroup: "همسترینگ", equipment: "دمبل", difficulty: "متوسط", sets: 3, reps: "12", description: "ددلیفت رومانیایی" },
        { name: "هیپ تراست", muscleGroup: "باسن", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "15", description: "گلوت بریج / هیپ تراست" },
        { name: "ساق پا ایستاده", muscleGroup: "ساق", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "20", description: "بلند شدن روی پنجه‌ی پا" },
        { name: "برپی", muscleGroup: "فول‌بادی", equipment: "بدون تجهیزات", difficulty: "پیشرفته", sets: 3, reps: "8-10", description: "حرکت ترکیبی برپی" },
        { name: "مانتین کلایمبر", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "متوسط", sets: 3, reps: "20 هر پا", description: "کوهنورد (مانتین کلایمبر)" },
        { name: "جامپینگ جک", muscleGroup: "فول‌بادی", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "30", description: "پرش ستاره‌ای" },
        { name: "کرانچ شکم", muscleGroup: "شکم", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "15-20", description: "کرانچ سنتی" },
        { name: "سوپرمن", muscleGroup: "پشت", equipment: "بدون تجهیزات", difficulty: "مبتدی", sets: 3, reps: "12", description: "حرکت سوپرمن برای تقویت کمر" }
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