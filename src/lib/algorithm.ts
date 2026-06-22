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

    const ageValue = get("age");
    const ageMap: Record<string, number> = {
        "18-23": 20,
        "24-29": 26,
        "30s": 35,
        "40s": 45,
        "50+": 55,
    };
    const age = ageMap[ageValue] || 30;

    const activityValue = get("dailyActivity");
    const activityMap: Record<string, string> = {
        sedentary: "sedentary",
        standing: "light",
        mixed: "moderate",
        varies: "light",
    };

    const goalValue = get("goal");
    const goalMap: Record<string, string> = {
        lose: "lose",
        muscle: "muscle",
        recomposition: "lose",
        "overall-fitness": "maintain",
    };

    const experienceValue = get("experience");
    const fitnessMap: Record<string, string> = {
        beginner: "beginner",
        comfortable: "intermediate",
        experienced: "advanced",
    };

    const equipValue = get("equipment");
    const equipList = equipValue ? equipValue.split(",") : [];

    return {
        age,
        height: 165,
        weight: 65,
        targetWeight: 65,
        activityLevel: activityMap[activityValue] || "moderate",
        goal: goalMap[goalValue] || "lose",
        dietaryRestrictions: [],
        workoutDays: parseInt(get("workoutDays")) || 3,
        equipment:
            equipList.includes("dumbbell") || equipList.includes("band")
                ? "home-basic"
                : equipList.includes("machine") || equipList.includes("barbell")
                  ? "gym"
                  : "none",
        fitnessLevel: fitnessMap[experienceValue] || "beginner",
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

    const allFoods = await prisma.foodItem.findMany();

    const breakfasts = allFoods.filter((f) => f.mealType === "breakfast");
    const lunches = allFoods.filter((f) => f.mealType === "lunch");
    const dinners = allFoods.filter((f) => f.mealType === "dinner");
    const snacks = allFoods.filter((f) => f.mealType === "snack");

    const dietPlan = await prisma.dietPlan.create({
        data: {
            userId,
            dailyCalorieTarget: dailyCalories,
        },
    });

    for (let day = 1; day <= 7; day++) {
        const pick = (arr: typeof allFoods) =>
            arr[Math.floor(Math.random() * arr.length)];

        const dayMeals = [
            { food: pick(breakfasts), slot: "breakfast" },
            { food: pick(lunches), slot: "lunch" },
            { food: pick(dinners), slot: "dinner" },
            { food: pick(snacks), slot: "snack" },
        ];

        let totalCal = dayMeals.reduce((sum, m) => sum + (m.food?.calories || 0), 0);
        let attempts = 0;

        while (
            Math.abs(totalCal - dailyCalories) > dailyCalories * 0.15 &&
            attempts < 20
        ) {
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

    let filtered = allExercises;
    if (quiz.equipment === "none") {
        filtered = allExercises.filter(
            (e) => e.equipment === "بدون تجهیزات" || e.equipment === "none"
        );
    }

    if (quiz.fitnessLevel === "beginner") {
        filtered = filtered.filter((e) => e.difficulty !== "پیشرفته");
    }

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

        const count = Math.min(dayExercises.length, quiz.fitnessLevel === "beginner" ? 4 : 5);
        const shuffled = dayExercises.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

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
