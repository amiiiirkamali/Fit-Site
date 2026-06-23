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
        recomposition: "maintain",
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
    // Mifflin-St Jeor equation for women
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

const MIN_CALORIES = 1200;
const CALORIE_TOLERANCE = 0.10; // ±10%

async function getUserPhysicalData(userId: string): Promise<{ weight: number; height: number; age: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return {
        weight: user?.weight ?? 65,
        height: user?.height ?? 165,
        age: user?.age ?? 30,
    };
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick meals whose total calories land within ±10% of target.
 *  Uses a smarter strategy: repeatedly replace the meal farthest from
 *  the average per‑meal calorie share. */
function buildDayMeals(
    breakfasts: any[],
    lunches: any[],
    dinners: any[],
    snacks: any[],
    targetCal: number,
): { food: any; slot: string }[] {
    const lists = [breakfasts, lunches, dinners, snacks];
    const slots = ["breakfast", "lunch", "dinner", "snack"];
    const perMealTarget = targetCal / 4;

    const meals = lists.map((list) => ({
        food: pickRandom(list),
        slot: slots[lists.indexOf(list)],
    }));

    let total = meals.reduce((s, m) => s + (m.food?.calories || 0), 0);

    for (let attempt = 0; attempt < 30; attempt++) {
        const diff = Math.abs(total - targetCal);
        if (diff <= targetCal * CALORIE_TOLERANCE) break;

        // Find the meal farthest from the average share
        let worstIdx = 0;
        let worstDev = 0;
        for (let i = 0; i < meals.length; i++) {
            const dev = Math.abs((meals[i].food?.calories || 0) - perMealTarget);
            if (dev > worstDev) {
                worstDev = dev;
                worstIdx = i;
            }
        }

        // Replace it with a random one from the same meal type
        meals[worstIdx].food = pickRandom(lists[worstIdx]);
        total = meals.reduce((s, m) => s + (m.food?.calories || 0), 0);
    }

    return meals;
}

// ─────────────────────────────────────────────────
//  DIET PLAN
// ─────────────────────────────────────────────────

export async function fillMissingDietDays(dietPlanId: string): Promise<void> {
    const plan = await prisma.dietPlan.findUnique({
        where: { id: dietPlanId },
        include: { items: { orderBy: { day: "desc" }, take: 1 } },
    });
    if (!plan) return;

    const maxDay = plan.items[0]?.day || 0;
    if (maxDay >= 30) return;

    const allFoods = await prisma.foodItem.findMany();
    const breakfasts = allFoods.filter((f) => f.mealType === "breakfast");
    const lunches = allFoods.filter((f) => f.mealType === "lunch");
    const dinners = allFoods.filter((f) => f.mealType === "dinner");
    const snacks = allFoods.filter((f) => f.mealType === "snack");

    for (let day = maxDay + 1; day <= 30; day++) {
        const meals = buildDayMeals(breakfasts, lunches, dinners, snacks, plan.dailyCalorieTarget);

        for (const meal of meals) {
            if (meal.food) {
                await prisma.dietPlanItem.create({
                    data: {
                        dietPlanId: plan.id,
                        foodItemId: meal.food.id,
                        day,
                        mealSlot: meal.slot,
                    },
                });
            }
        }
    }
}

export async function generateDietPlan(userId: string): Promise<string> {
    const answers = await prisma.quizAnswer.findMany({ where: { userId } });
    const quiz = parseQuizAnswers(answers);
    const { weight, height, age } = await getUserPhysicalData(userId);

    const bmr = calculateBMR(weight, height, age);
    const tdee = Math.round(bmr * getActivityMultiplier(quiz.activityLevel));
    const dailyCalories = Math.max(MIN_CALORIES, Math.round(tdee + getCalorieAdjustment(quiz.goal)));

    const allFoods = await prisma.foodItem.findMany();
    const breakfasts = allFoods.filter((f) => f.mealType === "breakfast");
    const lunches = allFoods.filter((f) => f.mealType === "lunch");
    const dinners = allFoods.filter((f) => f.mealType === "dinner");
    const snacks = allFoods.filter((f) => f.mealType === "snack");

    const dietPlan = await prisma.dietPlan.create({
        data: { userId, dailyCalorieTarget: dailyCalories },
    });

    for (let day = 1; day <= 30; day++) {
        const meals = buildDayMeals(breakfasts, lunches, dinners, snacks, dailyCalories);

        for (const meal of meals) {
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

// ─────────────────────────────────────────────────
//  WORKOUT PLAN (Enhanced)
// ─────────────────────────────────────────────────

type WorkoutLocation = "home" | "gym" | "mixed";

function determineLocation(equipment: string[]): WorkoutLocation {
    const hasGymEquip =
        equipment.includes("machine") ||
        equipment.includes("barbell") ||
        equipment.includes("کابل");
    const hasHomeEquip =
        equipment.includes("dumbbell") ||
        equipment.includes("band") ||
        equipment.includes("bench");

    if (hasGymEquip) return "gym";
    if (hasHomeEquip) return "home";
    return "home";
}

const WEEKDAY_NAMES = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
];

/** Generate workout day indices based on days-per-week. Returns 7‑element boolean array [Sat..Fri]. */
function getWeeklySchedule(daysPerWeek: number): boolean[] {
    // Persian week: Sat(0) Sun(1) Mon(2) Tue(3) Wed(4) Thu(5) Fri(6)
    const schedules: Record<number, boolean[]> = {
        2: [true, false, false, false, true, false, false],  // Sat + Wed
        3: [true, false, true, false, true, false, false],   // Sat + Mon + Wed
        4: [true, true, false, true, false, true, false],    // Sat + Sun + Tue + Thu
        5: [true, true, true, true, true, false, false],     // Sat ~ Wed
        6: [true, true, true, true, true, true, false],      // Sat ~ Thu
    };
    return schedules[daysPerWeek] || schedules[3];
}

/** Determine how many cardio minutes to include based on total duration */
function getCardioMinutes(duration: string): number {
    switch (duration) {
        case "15": return 3;
        case "30": return 5;
        case "45": return 8;
        case "60+": return 10;
        default: return 5;
    }
}

/** Persian day names for the workout schedule */
const PERSIAN_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export async function generateWorkoutPlan(userId: string): Promise<string> {
    const answers = await prisma.quizAnswer.findMany({ where: { userId } });
    const quiz = parseQuizAnswers(answers);

    // Read raw equipment from answers for location detection
    const equipRaw = answers.find((a) => a.questionKey === "equipment")?.answerValue || "";
    const equipList = equipRaw.split(",").filter(Boolean);
    const location = determineLocation(equipList);

    // Read duration
    const durationValue = answers.find((a) => a.questionKey === "workoutDuration")?.answerValue || "30";
    const cardioMin = getCardioMinutes(durationValue);
    const strengthMin = parseInt(durationValue) || 30 - cardioMin;

    const schedule = getWeeklySchedule(quiz.workoutDays);
    // Fixed mapping: day 1 of plan is always Saturday (schedule index 0).
    // No startWeekday offset — both algorithm and frontend use the same fixed mapping.
    const workoutDayIndices = schedule
        .map((isWorkout, idx) => (isWorkout ? idx : -1))
        .filter((idx) => idx >= 0);

    const allExercises = await prisma.exerciseItem.findMany();

    // Separate cardio vs strength
    const cardioExercises = allExercises.filter(
        (e) => e.muscleGroup === "کاردیو"
    );

    let strengthExercises = allExercises.filter(
        (e) => e.muscleGroup !== "کاردیو"
    );

    // Filter by location (equipment)
    if (location === "home") {
        // Home: only bodyweight, dumbbell, band, bench
        strengthExercises = strengthExercises.filter(
            (e) =>
                e.equipment === "بدون تجهیزات" ||
                e.equipment === "دمبل" ||
                e.equipment === "کش" ||
                e.equipment === "نیمکت"
        );
    } else if (location === "gym") {
        // Gym: include all equipment types
        // Only exclude "none" if we want — but gym has everything
    }

    // Filter by fitness level
    if (quiz.fitnessLevel === "beginner") {
        strengthExercises = strengthExercises.filter(
            (e) => e.difficulty !== "پیشرفته"
        );
    }

    // Build muscle group splits based on days per week & location
    const splits: Record<number, string[]> = {
        2: ["فول‌بادی", "پایین‌تنه"],
        3: ["بالاتنه", "پایین‌تنه", "فول‌بادی"],
        4: ["بالاتنه", "پایین‌تنه", "بالاتنه", "پایین‌تنه"],
        5: ["سینه و جلو بازو", "پا و باسن", "شانه و پشت بازو", "پشت", "شکم و فول‌بادی"],
        6: ["سینه", "پا و باسن", "شانه", "پشت", "بازو", "شکم و فول‌بادی"],
    };

    const weeklySplit = splits[quiz.workoutDays] || splits[3];

    const workoutPlan = await prisma.workoutPlan.create({
        data: {
            userId,
            weeklySplit: weeklySplit.join(" | "),
        },
    });

    // Update weeklySplit with schedule info
    await prisma.workoutPlan.update({
        where: { id: workoutPlan.id },
        data: {
            weeklySplit: [
                ...weeklySplit,
                `location:${location}`,
                `duration:${durationValue}`,
                `schedule:${schedule.map((s) => (s ? "1" : "0")).join("")}`,
            ].join(" | "),
        },
    });

    const muscleGroupMap: Record<string, string[]> = {
        "فول‌بادی": ["سینه", "پا", "شانه", "پشت", "شکم", "باسن"],
        "بالاتنه": ["سینه", "شانه", "بازو", "پشت"],
        "پایین‌تنه": ["پا", "باسن", "همسترینگ", "ساق"],
        "سینه و جلو بازو": ["سینه", "بازو"],
        "پا و باسن": ["پا", "باسن", "همسترینگ", "ساق"],
        "شانه و پشت بازو": ["شانه", "بازو"],
        "پشت": ["پشت"],
        "بازو": ["بازو"],
        "شکم و فول‌بادی": ["شکم", "سینه", "پا"],
        "سینه": ["سینه"],
        "شانه": ["شانه"],
    };

    const recentStrengthIds = new Set<string>();
    const recentCardioIds = new Set<string>();

    // Determine how many strength exercises per session based on duration
    const exercisesPerSession =
        durationValue === "15" ? 3 :
        durationValue === "30" ? 4 :
        durationValue === "45" ? 5 : 6;

    // Determine how many cardio rounds
    const cardioRounds =
        cardioMin <= 3 ? 1 :
        cardioMin <= 5 ? 2 :
        cardioMin <= 8 ? 3 : 4;

    for (let day = 0; day < 30; day++) {
        // Fixed mapping: day 0 → Saturday (index 0), day 1 → Sunday, ...
        const dayOfWeek = day % 7;

        if (!schedule[dayOfWeek]) {
            continue;
        }

        const splitIdx = workoutDayIndices.indexOf(dayOfWeek) % weeklySplit.length;
        const targetGroups = muscleGroupMap[weeklySplit[splitIdx]] || ["فول‌بادی"];

        // ─── 1. Pick cardio (warm-up) ───
        const cardioPool = [...cardioExercises];
        for (let i = cardioPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardioPool[i], cardioPool[j]] = [cardioPool[j], cardioPool[i]];
        }
        const freshCardio = cardioPool.filter((e) => !recentCardioIds.has(e.id));
        const selectedCardio = freshCardio.slice(0, cardioRounds);
        if (selectedCardio.length < cardioRounds) {
            const extra = cardioPool.filter((e) => !selectedCardio.includes(e));
            selectedCardio.push(...extra.slice(0, cardioRounds - selectedCardio.length));
        }
        for (const ex of selectedCardio) recentCardioIds.add(ex.id);
        if (recentCardioIds.size > 15) {
            const ids = Array.from(recentCardioIds);
            for (const id of ids.slice(0, 8)) recentCardioIds.delete(id);
        }

        // ─── 2. Pick strength exercises ───
        const pool = [...strengthExercises].filter((e) =>
            targetGroups.includes(e.muscleGroup) ||
            // Also include exercises whose group name appears in target groups
            targetGroups.some((tg) => e.muscleGroup.includes(tg) || tg.includes(e.muscleGroup))
        );

        if (pool.length < exercisesPerSession) {
            // Fallback: include any strength exercise
            const extras = strengthExercises.filter(
                (e) => !pool.includes(e)
            );
            pool.push(...extras.slice(0, exercisesPerSession - pool.length));
        }

        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Prefer fresh exercises (not used in recent days)
        const fresh = pool.filter((e) => !recentStrengthIds.has(e.id));
        const selected = [
            ...fresh.slice(0, exercisesPerSession),
            ...pool.slice(exercisesPerSession, exercisesPerSession * 2),
        ].slice(0, exercisesPerSession);

        if (selected.length < 3 && pool.length > selected.length) {
            const extras = pool.filter((e) => !selected.includes(e));
            selected.push(...extras.slice(0, 3 - selected.length));
        }

        for (const ex of selected) recentStrengthIds.add(ex.id);
        if (recentStrengthIds.size > 40) {
            const ids = Array.from(recentStrengthIds);
            for (const id of ids.slice(0, 20)) recentStrengthIds.delete(id);
        }

        // ─── 3. Save: cardio first, then strength ───
        // Save cardio exercises
        for (const exercise of selectedCardio) {
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

        // Save strength exercises
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

// Helper for workout page to parse schedule from weeklySplit
export function parseWorkoutMetadata(weeklySplit: string): {
    splitLabels: string[];
    location: WorkoutLocation;
    duration: string;
    schedule: boolean[];
    workoutDayNames: string[];
} {
    const parts = weeklySplit.split(" | ");
    const splitLabels = parts.filter(
        (p) =>
            !p.startsWith("location:") &&
            !p.startsWith("duration:") &&
            !p.startsWith("schedule:")
    );
    const locationPart = parts.find((p) => p.startsWith("location:"));
    const durationPart = parts.find((p) => p.startsWith("duration:"));
    const schedulePart = parts.find((p) => p.startsWith("schedule:"));

    const location = (locationPart?.replace("location:", "") || "home") as WorkoutLocation;
    const duration = durationPart?.replace("duration:", "") || "30";
    const schedule = (schedulePart?.replace("schedule:", "") || "1010100")
        .split("")
        .map((c) => c === "1");

    const workoutDayNames = PERSIAN_WEEKDAYS.filter((_, i) => schedule[i]);

    return { splitLabels, location, duration, schedule, workoutDayNames };
}
