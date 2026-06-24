"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, ChevronDown, Salad, Dumbbell, Clock } from "lucide-react";

interface PlanGroupSummary {
    id: string;
    programNumber: number;
    createdAt: string;
    isExpired: boolean;
    dietPlan: { id: string } | null;
    workoutPlan: { id: string } | null;
}

function toPersianNum(n: number): string {
    return n.toLocaleString("fa-IR");
}

export default function PlansDropdown() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<PlanGroupSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("/api/plan/my-plans", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success && Array.isArray(data.planGroups)) {
                    setGroups(data.planGroups);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const goTo = (path: "diet" | "workout", planId: string) => {
        setOpen(false);
        router.push(`/dashboard/${path}?planId=${planId}`);
    };

    if (loading || groups.length === 0) return null;

    return (
        <div ref={wrapRef} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#6b7280",
                    background: "transparent",
                    border: "1.5px solid rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                }}
            >
                <ListChecks size={16} />
                برنامه‌های من ({toPersianNum(groups.length)})
                <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        insetInlineEnd: 0,
                        width: 320,
                        maxHeight: 420,
                        overflowY: "auto",
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                        zIndex: 200,
                        padding: 8,
                    }}
                >
                    {groups.map((g, idx) => {
                        const num = groups.length - idx;
                        const date = new Date(g.createdAt).toLocaleDateString("fa-IR");
                        return (
                            <div
                                key={g.id}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    marginBottom: 4,
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    background: g.isExpired ? "rgba(0,0,0,0.02)" : "rgba(194,24,91,0.03)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 8,
                                    }}
                                >
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e" }}>
                                        برنامه شماره {toPersianNum(num)}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: g.isExpired ? "#ef4444" : "#10b981",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        <Clock size={11} />
                                        {date} {g.isExpired ? "(منقضی)" : ""}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        disabled={!g.dietPlan}
                                        onClick={() => g.dietPlan && goTo("diet", g.dietPlan.id)}
                                        style={{
                                            flex: 1,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            padding: "8px 10px",
                                            borderRadius: 10,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            border: "none",
                                            cursor: g.dietPlan ? "pointer" : "not-allowed",
                                            opacity: g.dietPlan ? 1 : 0.4,
                                            background: "linear-gradient(135deg,#10b981,#059669)",
                                            color: "#fff",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        <Salad size={13} /> غذایی
                                    </button>
                                    <button
                                        disabled={!g.workoutPlan}
                                        onClick={() => g.workoutPlan && goTo("workout", g.workoutPlan.id)}
                                        style={{
                                            flex: 1,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            padding: "8px 10px",
                                            borderRadius: 10,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            border: "none",
                                            cursor: g.workoutPlan ? "pointer" : "not-allowed",
                                            opacity: g.workoutPlan ? 1 : 0.4,
                                            background: "linear-gradient(135deg,#e8568f,#c2185b)",
                                            color: "#fff",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        <Dumbbell size={13} /> ورزشی
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
