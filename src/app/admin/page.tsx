"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function AdminPage() {
    const [secretKey, setSecretKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<"foods" | "exercises">("foods");

    // Food form
    const [foodName, setFoodName] = useState("");
    const [foodCalories, setFoodCalories] = useState("");
    const [foodProtein, setFoodProtein] = useState("");
    const [foodCarbs, setFoodCarbs] = useState("");
    const [foodFat, setFoodFat] = useState("");
    const [foodMealType, setFoodMealType] = useState("breakfast");
    const [foodDescription, setFoodDescription] = useState("");

    // Exercise form
    const [exName, setExName] = useState("");
    const [exMuscleGroup, setExMuscleGroup] = useState("");
    const [exEquipment, setExEquipment] = useState("");
    const [exDifficulty, setExDifficulty] = useState("مبتدی");
    const [exSets, setExSets] = useState("3");
    const [exReps, setExReps] = useState("12");
    const [exDescription, setExDescription] = useState("");
    const [exGifUrl, setExGifUrl] = useState("");

    const [message, setMessage] = useState("");

    const handleAuth = () => {
        if (secretKey === "531382") {
            setAuthenticated(true);
        } else {
            setMessage("کلید نادرست است");
        }
    };

    const handleAddFood = async () => {
        try {
            const res = await fetch("/api/admin/foods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": secretKey,
                },
                body: JSON.stringify({
                    name: foodName,
                    calories: parseInt(foodCalories),
                    protein: parseFloat(foodProtein),
                    carbs: parseFloat(foodCarbs),
                    fat: parseFloat(foodFat),
                    mealType: foodMealType,
                    description: foodDescription,
                    dietaryTags: ["عادی"],
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage("غذا با موفقیت اضافه شد ✅");
                setFoodName("");
                setFoodCalories("");
                setFoodProtein("");
                setFoodCarbs("");
                setFoodFat("");
                setFoodDescription("");
            } else {
                setMessage(data.message || "خطا");
            }
        } catch {
            setMessage("خطا در ارتباط");
        }
    };

    const handleAddExercise = async () => {
        try {
            const res = await fetch("/api/admin/exercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": secretKey,
                },
                body: JSON.stringify({
                    name: exName,
                    muscleGroup: exMuscleGroup,
                    equipment: exEquipment,
                    difficulty: exDifficulty,
                    sets: parseInt(exSets),
                    reps: exReps,
                    description: exDescription,
                    gifUrl: exGifUrl || undefined,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage("تمرین با موفقیت اضافه شد ✅");
                setExName("");
                setExMuscleGroup("");
                setExEquipment("");
                setExDescription("");
                setExGifUrl("");
            } else {
                setMessage(data.message || "خطا");
            }
        } catch {
            setMessage("خطا در ارتباط");
        }
    };

    if (!authenticated) {
        return (
            <main className={styles.page}>
                <div className={styles.authBox}>
                    <h1>پنل مدیریت</h1>
                    <input
                        type="password"
                        placeholder="کلید مدیریت"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className={styles.input}
                    />
                    <button onClick={handleAuth} className={styles.btn}>
                        ورود
                    </button>
                    {message && <p className={styles.msg}>{message}</p>}
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <h1 className={styles.title}>پنل مدیریت</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "foods" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("foods")}
                >
                    غذاها
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "exercises" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("exercises")}
                >
                    تمرین‌ها
                </button>
            </div>

            {message && <p className={styles.msg}>{message}</p>}

            {activeTab === "foods" && (
                <div className={styles.form}>
                    <input className={styles.input} placeholder="نام غذا" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
                    <input className={styles.input} placeholder="کالری" type="number" value={foodCalories} onChange={(e) => setFoodCalories(e.target.value)} />
                    <input className={styles.input} placeholder="پروتئین (گرم)" type="number" value={foodProtein} onChange={(e) => setFoodProtein(e.target.value)} />
                    <input className={styles.input} placeholder="کربوهیدرات (گرم)" type="number" value={foodCarbs} onChange={(e) => setFoodCarbs(e.target.value)} />
                    <input className={styles.input} placeholder="چربی (گرم)" type="number" value={foodFat} onChange={(e) => setFoodFat(e.target.value)} />
                    <select className={styles.input} value={foodMealType} onChange={(e) => setFoodMealType(e.target.value)}>
                        <option value="breakfast">صبحانه</option>
                        <option value="lunch">ناهار</option>
                        <option value="dinner">شام</option>
                        <option value="snack">میان‌وعده</option>
                    </select>
                    <textarea className={styles.input} placeholder="توضیحات" value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)} />
                    <button onClick={handleAddFood} className={styles.btn}>اضافه کردن غذا</button>
                </div>
            )}

            {activeTab === "exercises" && (
                <div className={styles.form}>
                    <input className={styles.input} placeholder="نام تمرین" value={exName} onChange={(e) => setExName(e.target.value)} />
                    <input className={styles.input} placeholder="گروه عضلانی" value={exMuscleGroup} onChange={(e) => setExMuscleGroup(e.target.value)} />
                    <input className={styles.input} placeholder="تجهیزات" value={exEquipment} onChange={(e) => setExEquipment(e.target.value)} />
                    <select className={styles.input} value={exDifficulty} onChange={(e) => setExDifficulty(e.target.value)}>
                        <option value="مبتدی">مبتدی</option>
                        <option value="متوسط">متوسط</option>
                        <option value="پیشرفته">پیشرفته</option>
                    </select>
                    <input className={styles.input} placeholder="تعداد ست" type="number" value={exSets} onChange={(e) => setExSets(e.target.value)} />
                    <input className={styles.input} placeholder="تعداد تکرار" value={exReps} onChange={(e) => setExReps(e.target.value)} />
                    <input className={styles.input} placeholder="لینک گیف (اختیاری)" value={exGifUrl} onChange={(e) => setExGifUrl(e.target.value)} />
                    <textarea className={styles.input} placeholder="توضیحات" value={exDescription} onChange={(e) => setExDescription(e.target.value)} />
                    <button onClick={handleAddExercise} className={styles.btn}>اضافه کردن تمرین</button>
                </div>
            )}
        </main>
    );
}