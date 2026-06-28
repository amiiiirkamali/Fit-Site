"use client";

import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    Dumbbell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Phone,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Activity,
    ClipboardList,
    Search,
    User,
    Shield,
    Target,
    Ruler,
    Weight,
    Flame,
    Trash2,
    KeyRound,
} from "lucide-react";
import styles from "./page.module.css";

type TabKey = "dashboard" | "users" | "foods" | "exercises";

interface UserData {
    id: string;
    phone: string;
    isVerified: boolean;
    hasPaid: boolean;
    name?: string | null;
    gender?: string | null;
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    targetWeight?: number | null;
    goal?: string | null;
    activityLevel?: string | null;
    createdAt: string;
    updatedAt: string;
    quizAnswers: { questionKey: string; answerValue: string }[];
    payments: {
        id: string;
        amount: number;
        status: string;
        planType: string;
        programsCount: number;
        createdAt: string;
    }[];
    programs: {
        id: string;
        programNumber: number;
        createdAt: string;
        dietPlan: {
            id: string;
            dailyCalorieTarget: number;
            items: {
                day: number;
                mealSlot: string;
                foodItem: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number };
            }[];
        } | null;
        workoutPlan: {
            id: string;
            weeklySplit: string;
            items: {
                day: number;
                sets: number;
                reps: string;
                exerciseItem: { id: string; name: string; muscleGroup: string; difficulty: string };
            }[];
        } | null;
    }[];
    cardioLogs: { id: string; exerciseId: string; day: number; createdAt: string }[];
}

interface StatsData {
    totalUsers: number;
    paidUsers: number;
    verifiedUsers: number;
    totalPrograms: number;
    totalPaymentsAmount: number;
    todayUsers: number;
    totalFoods: number;
    totalExercises: number;
    totalCardioLogs: number;
}

function toPersianNum(n: number | string): string {
    const num = typeof n === "string" ? parseInt(n) : n;
    if (isNaN(num)) return String(n);
    return num.toLocaleString("fa-IR");
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const goalLabels: Record<string, string> = {
    lose: "کاهش وزن",
    muscle: "افزایش عضله",
    recomposition: "بازترکیب بدن",
    maintain: "حفظ وزن",
};

const activityLabels: Record<string, string> = {
    sedentary: "کم تحرک",
    light: "کم فعالیت",
    moderate: "متوسط",
    active: "فعال",
    very_active: "بسیار فعال",
};

const ADMIN_PHONES = ["09190337538", "09127371154"];

export default function AdminPage() {
    const [step, setStep] = useState<"loading" | "login" | "panel">("loading");
    const [adminKey, setAdminKey] = useState("");
    const [loginPhone, setLoginPhone] = useState("");
    const [loginKey, setLoginKey] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [stats, setStats] = useState<StatsData | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [foodsList, setFoodsList] = useState<any[]>([]);
    const [exercisesList, setExercisesList] = useState<any[]>([]);
    const [foodForm, setFoodForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "breakfast", description: "" });
    const [exForm, setExForm] = useState({ name: "", muscleGroup: "", equipment: "", difficulty: "مبتدی", sets: "3", reps: "12", description: "", gifUrl: "" });
    const [formMsg, setFormMsg] = useState("");

    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
    const [deletingUser, setDeletingUser] = useState<string | null>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem("admin-key");
        const savedPhone = sessionStorage.getItem("admin-phone");
        if (saved && savedPhone) {
            setAdminKey(saved);
            setLoginPhone(savedPhone);
            setStep("panel");
            fetchAllData(saved);
        } else {
            setStep("login");
        }
    }, []);

    const fetchAllData = async (key: string) => {
        setLoadingData(true);
        try {
            const [statsRes, usersRes, foodsRes, exercisesRes] = await Promise.all([
                fetch("/api/admin/stats", { headers: { "x-admin-key": key } }),
                fetch("/api/admin/users", { headers: { "x-admin-key": key } }),
                fetch("/api/admin/foods", { headers: { "x-admin-key": key } }),
                fetch("/api/admin/exercises", { headers: { "x-admin-key": key } }),
            ]);

            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.stats);

            const usersData = await usersRes.json();
            if (usersData.success) setUsers(usersData.users);

            const foodsData = await foodsRes.json();
            if (foodsData.success) setFoodsList(foodsData.foods);

            const exercisesData = await exercisesRes.json();
            if (exercisesData.success) setExercisesList(exercisesData.exercises);
        } catch (e) {
            console.error(e);
        }
        setLoadingData(false);
    };

    const handleLogin = async () => {
        const phone = loginPhone.trim();
        const key = loginKey.trim();

        if (!phone) { setAuthError("شماره موبایل را وارد کنید"); return; }
        if (!key) { setAuthError("کلید مدیریت را وارد کنید"); return; }
        if (!ADMIN_PHONES.includes(phone)) { setAuthError("این شماره دسترسی ندارد"); return; }

        setAuthLoading(true);
        setAuthError("");
        try {
            const res = await fetch("/api/admin/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            });
            const data = await res.json();
            if (data.success) {
                setAdminKey(key);
                setLoginPhone(phone);
                sessionStorage.setItem("admin-key", key);
                sessionStorage.setItem("admin-phone", phone);
                setStep("panel");
                fetchAllData(key);
            } else {
                setAuthError("کلید نادرست است");
            }
        } catch {
            setAuthError("خطا در ارتباط");
        }
        setAuthLoading(false);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("admin-key");
        sessionStorage.removeItem("admin-phone");
        setAdminKey("");
        setLoginPhone("");
        setLoginKey("");
        setAuthError("");
        setStep("login");
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`آیا مطمئن هستید؟ کاربر "${userName}" به طور کامل حذف خواهد شد.`)) return;

        setDeletingUser(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: { "x-admin-key": adminKey },
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            } else {
                alert(data.message || "خطا در حذف کاربر");
            }
        } catch {
            alert("خطا در ارتباط");
        }
        setDeletingUser(null);
    };

    const handleAddFood = async () => {
        try {
            const res = await fetch("/api/admin/foods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": adminKey,
                },
                body: JSON.stringify({
                    name: foodForm.name,
                    calories: parseInt(foodForm.calories),
                    protein: parseFloat(foodForm.protein),
                    carbs: parseFloat(foodForm.carbs),
                    fat: parseFloat(foodForm.fat),
                    mealType: foodForm.mealType,
                    description: foodForm.description,
                    dietaryTags: ["عادی"],
                }),
            });
            const data = await res.json();
            if (data.success) {
                setFormMsg("غذا با موفقیت اضافه شد");
                setFoodForm({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "breakfast", description: "" });
                fetchAllData(adminKey);
            } else {
                setFormMsg(data.message || "خطا");
            }
        } catch {
            setFormMsg("خطا در ارتباط");
        }
    };

    const handleAddExercise = async () => {
        try {
            const res = await fetch("/api/admin/exercises", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": adminKey,
                },
                body: JSON.stringify({
                    name: exForm.name,
                    muscleGroup: exForm.muscleGroup,
                    equipment: exForm.equipment,
                    difficulty: exForm.difficulty,
                    sets: parseInt(exForm.sets),
                    reps: exForm.reps,
                    description: exForm.description,
                    gifUrl: exForm.gifUrl || undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setFormMsg("تمرین با موفقیت اضافه شد");
                setExForm({ name: "", muscleGroup: "", equipment: "", difficulty: "مبتدی", sets: "3", reps: "12", description: "", gifUrl: "" });
                fetchAllData(adminKey);
            } else {
                setFormMsg(data.message || "خطا");
            }
        } catch {
            setFormMsg("خطا در ارتباط");
        }
    };

    const toggleUserExpand = (id: string) => {
        setExpandedUsers((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredUsers = users.filter(
        (u) =>
            u.phone.includes(searchQuery) ||
            (u.name && u.name.includes(searchQuery))
    );

    if (step === "loading") {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loadingRing}>
                    <div className={styles.loadingRingInner} />
                </div>
                <p className={styles.loadingText}>در حال بارگذاری...</p>
            </div>
        );
    }

    if (step === "login") {
        return (
            <div className={styles.loginScreen}>
                <div className={styles.loginBg} />
                <div className={styles.loginCard}>
                    <div className={styles.loginLogo}>
                        <Shield size={32} />
                    </div>
                    <h1 className={styles.loginTitle}>پنل مدیریت</h1>
                    <p className={styles.loginSubtitle}>فیت‌بانو</p>

                    <form
                        className={styles.loginForm}
                        onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
                    >
                        <div className={styles.inputGroup}>
                            <Phone size={18} />
                            <input
                                className={styles.loginInput}
                                type="tel"
                                placeholder="شماره موبایل"
                                value={loginPhone}
                                onChange={(e) => setLoginPhone(e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <KeyRound size={18} />
                            <input
                                className={styles.loginInput}
                                type="password"
                                placeholder="کلید مدیریت"
                                value={loginKey}
                                onChange={(e) => setLoginKey(e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <button
                            className={styles.loginBtn}
                            type="submit"
                            disabled={authLoading}
                        >
                            {authLoading ? (
                                <Loader2 size={18} className={styles.spin} />
                            ) : (
                                "ورود"
                            )}
                        </button>
                    </form>

                    {authError && (
                        <div className={styles.loginError}>
                            <XCircle size={16} />
                            {authError}
                        </div>
                    )}

                    <div className={styles.loginHint}>
                        فقط ادمین‌ها دسترسی دارند
                    </div>
                </div>
            </div>
        );
    }

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
        { key: "users", label: "کاربران", icon: Users },
        { key: "foods", label: "غذاها", icon: UtensilsCrossed },
        { key: "exercises", label: "تمرین‌ها", icon: Dumbbell },
    ];

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <Shield size={22} />
                        {sidebarOpen && <span className={styles.sidebarBrand}>پنل مدیریت</span>}
                    </div>
                    <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`${styles.sidebarItem} ${activeTab === tab.key ? styles.sidebarItemActive : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <tab.icon size={20} />
                            {sidebarOpen && <span>{tab.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    {sidebarOpen && (
                        <div className={styles.sidebarUser}>
                            <User size={14} />
                            <span>{loginPhone}</span>
                        </div>
                    )}
                    <button className={styles.sidebarLogout} onClick={handleLogout}>
                        <LogOut size={18} />
                        {sidebarOpen && <span>خروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Dashboard */}
                {activeTab === "dashboard" && (
                    <div className={styles.tabContent}>
                        <div className={styles.tabHeader}>
                            <h2 className={styles.tabTitle}>داشبورد</h2>
                            <p className={styles.tabDesc}>نمای کلی از وضعیت سامانه</p>
                        </div>

                        {loadingData ? (
                            <div className={styles.loadingGrid}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={styles.statSkeleton} />
                                ))}
                            </div>
                        ) : stats ? (
                            <>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconPink}`}>
                                            <Users size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.totalUsers)}</span>
                                            <span className={styles.statLabel}>کل کاربران</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                                            <CheckCircle size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.verifiedUsers)}</span>
                                            <span className={styles.statLabel}>کاربران تأیید شده</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconGold}`}>
                                            <ShoppingCart size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.paidUsers)}</span>
                                            <span className={styles.statLabel}>کاربران پرداخت کرده</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                                            <DollarSign size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.totalPaymentsAmount)}</span>
                                            <span className={styles.statLabel}>مجموع پرداخت‌ها (تومان)</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                                            <Activity size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.totalPrograms)}</span>
                                            <span className={styles.statLabel}>برنامه‌های تولید شده</span>
                                        </div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={`${styles.statIcon} ${styles.statIconCyan}`}>
                                            <Calendar size={24} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statValue}>{toPersianNum(stats.todayUsers)}</span>
                                            <span className={styles.statLabel}>کاربران جدید امروز</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.secondaryStatsGrid}>
                                    <div className={styles.secondaryStatCard}>
                                        <UtensilsCrossed size={18} />
                                        <span>{toPersianNum(stats.totalFoods)} غذا</span>
                                    </div>
                                    <div className={styles.secondaryStatCard}>
                                        <Dumbbell size={18} />
                                        <span>{toPersianNum(stats.totalExercises)} تمرین</span>
                                    </div>
                                    <div className={styles.secondaryStatCard}>
                                        <TrendingUp size={18} />
                                        <span>{toPersianNum(stats.totalCardioLogs)} ثبت تمرین هوازی</span>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                {/* Users */}
                {activeTab === "users" && (
                    <div className={styles.tabContent}>
                        <div className={styles.tabHeader}>
                            <div>
                                <h2 className={styles.tabTitle}>کاربران</h2>
                                <p className={styles.tabDesc}>مشاهده و مدیریت تمام کاربران</p>
                            </div>
                            <div className={styles.searchBox}>
                                <Search size={18} />
                                <input
                                    className={styles.searchInput}
                                    type="text"
                                    placeholder="جستجوی کاربر..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingData ? (
                            <div className={styles.loadingGrid}>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={styles.userSkeleton} />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.usersList}>
                                {filteredUsers.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Users size={48} />
                                        <p>کاربری یافت نشد</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div key={user.id} className={styles.userCard}>
                                            <div className={styles.userCardHeader}>
                                                <div className={styles.userAvatar}>
                                                    {user.name ? user.name[0] : "?"}
                                                </div>
                                                <div className={styles.userMainInfo}>
                                                    <div className={styles.userNameRow}>
                                                        <span className={styles.userName}>
                                                            {user.name || "بدون نام"}
                                                        </span>
                                                        <span className={styles.userPhone}>{user.phone}</span>
                                                    </div>
                                                    <div className={styles.userBadges}>
                                                        <span className={`${styles.badge} ${user.isVerified ? styles.badgeSuccess : styles.badgeMuted}`}>
                                                            {user.isVerified ? "تأیید شده" : "تأیید نشده"}
                                                        </span>
                                                        <span className={`${styles.badge} ${user.hasPaid ? styles.badgeGold : styles.badgeMuted}`}>
                                                            {user.hasPaid ? "پرداخت کرده" : "پرداخت نکرده"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    className={styles.expandBtn}
                                                    onClick={() => toggleUserExpand(user.id)}
                                                >
                                                    {expandedUsers.has(user.id) ? (
                                                        <ChevronLeft size={20} />
                                                    ) : (
                                                        <ChevronLeft size={20} className={styles.chevronCollapsed} />
                                                    )}
                                                </button>
                                            </div>

                                            {expandedUsers.has(user.id) && (
                                                <div className={styles.userDetails}>
                                                    <div className={styles.detailsGrid}>
                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <User size={16} /> اطلاعات فردی
                                                            </h4>
                                                            <div className={styles.detailRows}>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}>جنسیت</span>
                                                                    <span className={styles.detailValue}>{user.gender === "male" ? "مرد" : user.gender === "female" ? "زن" : "——"}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}><Ruler size={14} /> قد</span>
                                                                    <span className={styles.detailValue}>{user.height ? `${toPersianNum(user.height)} سانتی‌متر` : "——"}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}><Weight size={14} /> وزن فعلی</span>
                                                                    <span className={styles.detailValue}>{user.weight ? `${toPersianNum(user.weight)} کیلوگرم` : "——"}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}><Target size={14} /> وزن هدف</span>
                                                                    <span className={styles.detailValue}>{user.targetWeight ? `${toPersianNum(user.targetWeight)} کیلوگرم` : "——"}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}><Flame size={14} /> هدف</span>
                                                                    <span className={styles.detailValue}>{user.goal ? (goalLabels[user.goal] || user.goal) : "——"}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}><Activity size={14} /> سطح فعالیت</span>
                                                                    <span className={styles.detailValue}>{user.activityLevel ? (activityLabels[user.activityLevel] || user.activityLevel) : "——"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <ClipboardList size={16} /> پاسخ‌های quiz
                                                            </h4>
                                                            {user.quizAnswers.length > 0 ? (
                                                                <div className={styles.quizAnswersGrid}>
                                                                    {user.quizAnswers.map((qa) => (
                                                                        <div key={qa.questionKey} className={styles.quizAnswerItem}>
                                                                            <span className={styles.qaKey}>{qa.questionKey}</span>
                                                                            <span className={styles.qaValue}>{qa.answerValue}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className={styles.noData}>پاسخی ثبت نشده</p>
                                                            )}
                                                        </div>

                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <ShoppingCart size={16} /> پرداخت‌ها
                                                            </h4>
                                                            {user.payments.length > 0 ? (
                                                                <div className={styles.paymentsList}>
                                                                    {user.payments.map((p) => (
                                                                        <div key={p.id} className={styles.paymentItem}>
                                                                            <div className={styles.paymentInfo}>
                                                                                <span className={`${styles.paymentStatus} ${p.status === "success" ? styles.paySuccess : p.status === "pending" ? styles.payPending : styles.payFailed}`}>
                                                                                    {p.status === "success" ? "موفق" : p.status === "pending" ? "در انتظار" : "ناموفق"}
                                                                                </span>
                                                                                <span className={styles.paymentAmount}>{toPersianNum(p.amount)} تومان</span>
                                                                            </div>
                                                                            <span className={styles.paymentMeta}>
                                                                                {p.programsCount} برنامه - {formatDate(p.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className={styles.noData}>پرداختی ثبت نشده</p>
                                                            )}
                                                        </div>

                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <Activity size={16} /> برنامه‌ها
                                                            </h4>
                                                            {user.programs.length > 0 ? (
                                                                <div className={styles.programsList}>
                                                                    {user.programs.map((prog) => (
                                                                        <div key={prog.id} className={styles.programItem}>
                                                                            <div className={styles.programHeader}>
                                                                                <span className={styles.programNumber}>برنامه {toPersianNum(prog.programNumber)}</span>
                                                                                <span className={styles.programDate}>{formatDate(prog.createdAt)}</span>
                                                                            </div>
                                                                            <div className={styles.programBadges}>
                                                                                {prog.dietPlan && (
                                                                                    <span className={styles.progBadgeDiet}>
                                                                                        رژیم ({toPersianNum(prog.dietPlan.dailyCalorieTarget)} کالری)
                                                                                    </span>
                                                                                )}
                                                                                {prog.workoutPlan && (
                                                                                    <span className={styles.progBadgeWorkout}>
                                                                                        تمرین
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className={styles.noData}>برنامه‌ای وجود ندارد</p>
                                                            )}
                                                        </div>

                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <Activity size={16} /> تمرین هوازی
                                                            </h4>
                                                            <span className={styles.cardioCount}>
                                                                {toPersianNum(user.cardioLogs.length)} ثبت
                                                            </span>
                                                        </div>

                                                        <div className={styles.detailSection}>
                                                            <h4 className={styles.detailSectionTitle}>
                                                                <Calendar size={16} /> تاریخ‌ها
                                                            </h4>
                                                            <div className={styles.detailRows}>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}>تاریخ ثبت‌نام</span>
                                                                    <span className={styles.detailValue}>{formatDate(user.createdAt)}</span>
                                                                </div>
                                                                <div className={styles.detailRow}>
                                                                    <span className={styles.detailLabel}>آخرین بروزرسانی</span>
                                                                    <span className={styles.detailValue}>{formatDate(user.updatedAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteUser(user.id, user.name || user.phone)}
                                                        disabled={deletingUser === user.id}
                                                    >
                                                        {deletingUser === user.id ? (
                                                            <Loader2 size={16} className={styles.spin} />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                        حذف کامل کاربر
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Foods */}
                {activeTab === "foods" && (
                    <div className={styles.tabContent}>
                        <div className={styles.tabHeader}>
                            <h2 className={styles.tabTitle}>مدیریت غذاها</h2>
                            <p className={styles.tabDesc}>افزودن و مشاهده مواد غذایی</p>
                        </div>

                        <div className={styles.crudLayout}>
                            <div className={styles.crudForm}>
                                <h3 className={styles.crudFormTitle}>افزودن غذا</h3>
                                <input className={styles.crudInput} placeholder="نام غذا" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
                                <input className={styles.crudInput} placeholder="کالری" type="number" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })} />
                                <input className={styles.crudInput} placeholder="پروتئین (گرم)" type="number" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} />
                                <input className={styles.crudInput} placeholder="کربوهیدرات (گرم)" type="number" value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} />
                                <input className={styles.crudInput} placeholder="چربی (گرم)" type="number" value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} />
                                <select className={styles.crudInput} value={foodForm.mealType} onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value })}>
                                    <option value="breakfast">صبحانه</option>
                                    <option value="lunch">ناهار</option>
                                    <option value="dinner">شام</option>
                                    <option value="snack">میان‌وعده</option>
                                </select>
                                <textarea className={`${styles.crudInput} ${styles.crudTextarea}`} placeholder="توضیحات" value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} />
                                <button className={styles.crudBtn} onClick={handleAddFood}>اضافه کردن غذا</button>
                                {formMsg && <p className={styles.formMsg}>{formMsg}</p>}
                            </div>

                            <div className={styles.crudList}>
                                <h3 className={styles.crudFormTitle}>غذاها ({toPersianNum(foodsList.length)})</h3>
                                <div className={styles.crudItems}>
                                    {foodsList.map((food) => (
                                        <div key={food.id} className={styles.crudItem}>
                                            <div className={styles.crudItemInfo}>
                                                <span className={styles.crudItemName}>{food.name}</span>
                                                <span className={styles.crudItemMeta}>
                                                    {food.calories} کالری | {food.protein}g پ | {food.carbs}g ک | {food.fat}g چ
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exercises */}
                {activeTab === "exercises" && (
                    <div className={styles.tabContent}>
                        <div className={styles.tabHeader}>
                            <h2 className={styles.tabTitle}>مدیریت تمرین‌ها</h2>
                            <p className={styles.tabDesc}>افزودن و مشاهده تمرینات</p>
                        </div>

                        <div className={styles.crudLayout}>
                            <div className={styles.crudForm}>
                                <h3 className={styles.crudFormTitle}>افزودن تمرین</h3>
                                <input className={styles.crudInput} placeholder="نام تمرین" value={exForm.name} onChange={(e) => setExForm({ ...exForm, name: e.target.value })} />
                                <input className={styles.crudInput} placeholder="گروه عضلانی" value={exForm.muscleGroup} onChange={(e) => setExForm({ ...exForm, muscleGroup: e.target.value })} />
                                <input className={styles.crudInput} placeholder="تجهیزات" value={exForm.equipment} onChange={(e) => setExForm({ ...exForm, equipment: e.target.value })} />
                                <select className={styles.crudInput} value={exForm.difficulty} onChange={(e) => setExForm({ ...exForm, difficulty: e.target.value })}>
                                    <option value="مبتدی">مبتدی</option>
                                    <option value="متوسط">متوسط</option>
                                    <option value="پیشرفته">پیشرفته</option>
                                </select>
                                <input className={styles.crudInput} placeholder="تعداد ست" type="number" value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: e.target.value })} />
                                <input className={styles.crudInput} placeholder="تعداد تکرار" value={exForm.reps} onChange={(e) => setExForm({ ...exForm, reps: e.target.value })} />
                                <input className={styles.crudInput} placeholder="لینک گیف (اختیاری)" value={exForm.gifUrl} onChange={(e) => setExForm({ ...exForm, gifUrl: e.target.value })} />
                                <textarea className={`${styles.crudInput} ${styles.crudTextarea}`} placeholder="توضیحات" value={exForm.description} onChange={(e) => setExForm({ ...exForm, description: e.target.value })} />
                                <button className={styles.crudBtn} onClick={handleAddExercise}>اضافه کردن تمرین</button>
                                {formMsg && <p className={styles.formMsg}>{formMsg}</p>}
                            </div>

                            <div className={styles.crudList}>
                                <h3 className={styles.crudFormTitle}>تمرین‌ها ({toPersianNum(exercisesList.length)})</h3>
                                <div className={styles.crudItems}>
                                    {exercisesList.map((ex) => (
                                        <div key={ex.id} className={styles.crudItem}>
                                            <div className={styles.crudItemInfo}>
                                                <span className={styles.crudItemName}>{ex.name}</span>
                                                <span className={styles.crudItemMeta}>
                                                    {ex.muscleGroup} | {ex.difficulty} | {ex.sets}×{ex.reps}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
