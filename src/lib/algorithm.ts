import { prisma } from "./prisma";

interface QuizData {
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
    activityLevel: string;
    goal: string;
    dietaryRestrictions: string[];
    workoutDays: number;
    equipment: string;
    fitnessLevel: string;
}

function parseQuizAnswers(
    answers: { questionKey: string; answerValue: string }[]
): QuizData {
    const get = (key: string) =>
        answers.find((a) => a.questionKey === key)?.answerValue || "";

    return {
        age: parseInt(get("age")) || 25,
        height: parseInt(get("height")) || 165,
        weight: parseInt(get("weight")) || 65,
        targetWeight: parseInt(get("targetWeight")) || 60,
        activityLevel: get("activityLevel") || "moderate",
        goal: get("goal") || "lose",
        dietaryRestrictions: get("dietaryRestrictions")
            ? get("dietaryRestrictions").split(",")
            : [],
        workoutDays: parseInt(get("workoutDays")) || 3,
        equipment: get("equipment") || "none",
        fitnessLevel: get("fitnessLevel") || "beginner",
    };
}

function calculateBMR(weight: number, height: number, age: number): number {
    return 10 * weight + 6.25 * height - 5 * age - 161;
}

function getActivityMultiplier(level: string): number {
    const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
    };
    return multipliers[level] || 1.55;
}

function getCalorieAdjustment(goal: string): number {
    switch (goal) {
        case "lose":
            return -400;
        case "gain":
            return 300;
        case "muscle":
            return 200;
        default:
            return 0;
    }
}

export async function generateDietPlan(userId: string): Promise<string> {
    const answers = await prisma.quizAnswer.findMany({ where: { userId } });
    const quiz = parseQuizAnswers(answers);

    const bmr = calculateBMR(quiz.weight, quiz.height, quiz.age);
    const tdee = bmr * getActivityMultiplier(quiz.activityLevel);
    const dailyCalories = Math.round(tdee + getCalorieAdjustment(quiz.goal));

    // Fetch all food items
    const allFoods = await prisma.foodItem.findMany();

    // Filter by dietary restrictions
    let filteredFoods = allFoods;
    if (quiz.dietaryRestrictions.length > 0) {
        filteredFoods = allFoods.filter((food) => {
            if (quiz.dietaryRestrictions.includes("وگان")) {
                return food.dietaryTags.includes("وگان");
            }
            if (quiz.dietaryRestrictions.includes("بدون‌گلوتن")) {
                return food.dietaryTags.includes("بدون‌گلوتن");
            }
            return true;
        });
    }

    // Group by meal type
    const breakfasts = filteredFoods.filter((f) => f.mealType === "breakfast");
    const lunches = filteredFoods.filter((f) => f.mealType === "lunch");
    const dinners = filteredFoods.filter((f) => f.mealType === "dinner");
    const snacks = filteredFoods.filter((f) => f.mealType === "snack");

    // Create the diet plan
    const dietPlan = await prisma.dietPlan.create({
        data: {
            userId,
            dailyCalorieTarget: dailyCalories,
        },
    });

    // Generate 7 days of meals
    for (let day = 1; day <= 7; day++) {
        const pick = (arr: typeof allFoods) =>
            arr[Math.floor(Math.random() * arr.length)];

        const dayMeals = [
            { food: pick(breakfasts), slot: "breakfast" },
            { food: pick(lunches), slot: "lunch" },
            { food: pick(dinners), slot: "dinner" },
            { food: pick(snacks), slot: "snack" },
        ];

        // Check total calories and adjust
        let totalCal = dayMeals.reduce((sum, m) => sum + (m.food?.calories || 0), 0);
        let attempts = 0;

        while (
            Math.abs(totalCal - dailyCalories) > dailyCalories * 0.15 &&
            attempts < 20
            ) {
            // Replace a random meal
            const idx = Math.floor(Math.random() * dayMeals.length);
            const lists = [breakfasts, lunches, dinners, snacks];
            dayMeals[idx].food = pick(lists[idx]);
            totalCal = dayMeals.reduce((sum, m) => sum + (m.food?.calories || 0), 0);
            attempts++;
        }

        for (const meal of dayMeals) {
            if (meal.food) {
                await prisma.dietPlanItem.create({
                    data: {
                        dietPlanId: dietPlan.id,
                        foodItemId: meal.food.id,
                        day,
                        mealSlot: meal.slot,
                    },
                });
            }
        }
    }

    return dietPlan.id;
}

export async function generateWorkoutPlan(userId: string): Promise<string> {
    const answers = await prisma.quizAnswer.findMany({ where: { userId } });
    const quiz = parseQuizAnswers(answers);

    const allExercises = await prisma.exerciseItem.findMany();

    // Filter by equipment
    let filtered = allExercises;
    if (quiz.equipment === "none" || quiz.equipment === "خانه") {
        filtered = allExercises.filter(
            (e) => e.equipment === "بدون تجهیزات" || e.equipment === "none"
        );
    }

    // Filter by difficulty
    if (quiz.fitnessLevel === "beginner" || quiz.fitnessLevel === "مبتدی") {
        filtered = filtered.filter((e) => e.difficulty !== "پیشرفته");
    }

    // Define weekly split
    const splits: Record<number, string[]> = {
        2: ["فول‌بادی", "فول‌بادی"],
        3: ["بالاتنه", "پایین‌تنه", "فول‌بادی"],
        4: ["سینه و بازو", "پا و باسن", "شانه و پشت", "شکم و فول‌بادی"],
        5: ["سینه", "پا", "شانه", "پشت و بازو", "شکم و فول‌بادی"],
        6: ["سینه", "پا", "شانه", "پشت", "بازو", "شکم"],
    };

    const weeklySplit = splits[quiz.workoutDays] || splits[3];

    const workoutPlan = await prisma.workoutPlan.create({
        data: {
            userId,
            weeklySplit: weeklySplit.join(" | "),
        },
    });

    const muscleGroupMap: Record<string, string[]> = {
        "فول‌بادی": ["سینه", "پا", "شانه", "پشت", "شکم", "فول‌بادی"],
        "بالاتنه": ["سینه", "شانه", "بازو", "پشت"],
        "پایین‌تنه": ["پا", "باسن", "همسترینگ", "ساق"],
        "سینه و بازو": ["سینه", "بازو"],
        "پا و باسن": ["پا", "باسن", "همسترینگ", "ساق"],
        "شانه و پشت": ["شانه", "پشت"],
        "شکم و فول‌بادی": ["شکم", "فول‌بادی"],
        "سینه": ["سینه"],
        "پا": ["پا", "باسن", "همسترینگ"],
        "شانه": ["شانه"],
        "پشت": ["پشت"],
        "پشت و بازو": ["پشت", "بازو"],
        "بازو": ["بازو"],
        "شکم": ["شکم"],
    };

    for (let day = 0; day < weeklySplit.length; day++) {
        const targetGroups = muscleGroupMap[weeklySplit[day]] || ["فول‌بادی"];

        const dayExercises = filtered.filter((e) =>
            targetGroups.includes(e.muscleGroup)
        );

        // Pick 4-6 exercises for the day
        const count = Math.min(dayExercises.length, quiz.fitnessLevel === "beginner" ? 4 : 5);
        const shuffled = dayExercises.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        // If not enough exercises, add from general pool
        if (selected.length < 3) {
            const extras = filtered
                .filter((e) => !selected.includes(e))
                .sort(() => Math.random() - 0.5)
                .slice(0, 3 - selected.length);
            selected.push(...extras);
        }

        for (const exercise of selected) {
            await prisma.workoutPlanItem.create({
                data: {
                    workoutPlanId: workoutPlan.id,
                    exerciseId: exercise.id,
                    day: day + 1,
                    sets: exercise.sets,
                    reps: exercise.reps,
                },
            });
        }
    }

    return workoutPlan.id;
}