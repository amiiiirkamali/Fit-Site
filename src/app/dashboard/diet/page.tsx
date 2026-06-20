"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
}

interface MealItem {
    mealSlot: string;
    foodItem: FoodItem;
}

interface DietPlan {
    id: string;
    dailyCalorieTarget: number;
    items: MealItem[];
}

const dayNames = [
    "شنبه",
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
];

const mealSlotNames: Record<string, string> = {
    breakfast: "صبحانه 🌅",
    lunch: "ناهار ☀️",
    dinner: "شام 🌙",
    snack: "میان‌وعده 🍎",
};

export default function DietPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(1);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.dietPlan) {
                    setPlan(data.dietPlan);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner} />
                </div>
            </main>
        );
    }

    if (!plan) {
        return (
            <main className={styles.page}>
                <div className={styles.emptyState}>
                    <p>برنامه‌ی غذایی هنوز ساخته نشده</p>
                    <button onClick={() => router.push("/dashboard")}>بازگشت</button>
                </div>
            </main>
        );
    }

    const dayMeals = plan.items.filter(
        (item: MealItem & { day?: number }) => (item as unknown as { day: number }).day === selectedDay
    );

    const totalCal = dayMeals.reduce((sum, m) => sum + m.foodItem.calories, 0);

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/dashboard")}
                >
                    →
                </button>
                <span className={styles.headerTitle}>برنامه غذایی</span>
                <div />
            </header>

            <section className={styles.content}>
                <div className={styles.calorieCard}>
                    <span className={styles.calorieLabel}>کالری هدف روزانه</span>
                    <span className={styles.calorieValue}>
            {plan.dailyCalorieTarget.toLocaleString("fa-IR")}
          </span>
                    <span className={styles.calorieUnit}>کیلوکالری</span>
                </div>

                {/* Day selector */}
                <div className={styles.dayTabs}>
                    {dayNames.map((name, i) => (
                        <button
                            key={i}
                            className={`${styles.dayTab} ${
                                selectedDay === i + 1 ? styles.dayTabActive : ""
                            }`}
                            onClick={() => setSelectedDay(i + 1)}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* Meals */}
                <div className={styles.meals}>
                    {["breakfast", "lunch", "dinner", "snack"].map((slot) => {
                        const meal = dayMeals.find((m) => m.mealSlot === slot);
                        if (!meal) return null;

                        return (
                            <div key={slot} className={styles.mealCard}>
                                <div className={styles.mealHeader}>
                  <span className={styles.mealSlot}>
                    {mealSlotNames[slot]}
                  </span>
                                    <span className={styles.mealCal}>
                    {meal.foodItem.calories} کالری
                  </span>
                                </div>
                                <h3 className={styles.mealName}>{meal.foodItem.name}</h3>
                                {meal.foodItem.description && (
                                    <p className={styles.mealDesc}>
                                        {meal.foodItem.description}
                                    </p>
                                )}
                                <div className={styles.macros}>
                                    <div className={styles.macro}>
                    <span className={styles.macroValue}>
                      {meal.foodItem.protein}g
                    </span>
                                        <span className={styles.macroLabel}>پروتئین</span>
                                    </div>
                                    <div className={styles.macro}>
                    <span className={styles.macroValue}>
                      {meal.foodItem.carbs}g
                    </span>
                                        <span className={styles.macroLabel}>کربوهیدرات</span>
                                    </div>
                                    <div className={styles.macro}>
                    <span className={styles.macroValue}>
                      {meal.foodItem.fat}g
                    </span>
                                        <span className={styles.macroLabel}>چربی</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.totalRow}>
                    <span>مجموع کالری روز:</span>
                    <span className={styles.totalValue}>
            {totalCal.toLocaleString("fa-IR")} کیلوکالری
          </span>
                </div>
            </section>
        </main>
    );
}