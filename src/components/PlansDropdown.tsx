"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, ChevronDown, Plus } from "lucide-react";

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
                    {groups.map((g) => {
                        const date = new Date(g.createdAt).toLocaleDateString("fa-IR");
                        return (
                            <div
                                key={g.id}
                                onClick={() => { setOpen(false); router.push(`/dashboard?program=${g.programNumber}`); }}
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    marginBottom: 4,
                                    border: "1px solid rgba(0,0,0,0.05)",
                                    background: g.isExpired ? "rgba(0,0,0,0.02)" : "rgba(194,24,91,0.03)",
                                    cursor: "pointer",
                                    transition: "background .15s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(194,24,91,0.08)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = g.isExpired ? "rgba(0,0,0,0.02)" : "rgba(194,24,91,0.03)"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 42,
                                        height: 42,
                                        borderRadius: 10,
                                        background: "linear-gradient(135deg,#e8568f,#c2185b)",
                                        color: "#fff",
                                        fontSize: 16,
                                        fontWeight: 800,
                                        fontFamily: "inherit",
                                        flexShrink: 0,
                                    }}>
                                        {toPersianNum(g.programNumber)}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>
                                            برنامه شماره {toPersianNum(g.programNumber)}
                                        </div>
                                        <div style={{ fontSize: 11, color: g.isExpired ? "#ef4444" : "#6b7280", marginTop: 2 }}>
                                            فعال از {date} {g.isExpired ? "(منقضی)" : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div
                        onClick={() => { setOpen(false); router.push("/quiz"); }}
                        style={{
                            marginTop: 8,
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1.5px dashed rgba(194,24,91,0.3)",
                            background: "rgba(194,24,91,0.04)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#c2185b",
                            transition: "background .15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(194,24,91,0.1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(194,24,91,0.04)"; }}
                    >
                        <Plus size={16} />
                        خرید برنامه جدید
                    </div>
                </div>
            )}
        </div>
    );
}
