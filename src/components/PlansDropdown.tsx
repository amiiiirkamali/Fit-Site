"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ListChecks, ChevronDown, Plus, X } from "lucide-react";

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
    const [isMobile, setIsMobile] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

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
        const handler = (e: MouseEvent | TouchEvent) => {
            if (isMobile) return;
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [isMobile]);

    useEffect(() => {
        if (open && isMobile) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [open, isMobile]);

    if (loading || groups.length === 0) return null;

    const triggerStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: isMobile ? 0 : 6,
        padding: isMobile ? "8px" : "9px 16px",
        borderRadius: isMobile ? 10 : 12,
        fontSize: 13,
        fontWeight: 700,
        color: "#6b7280",
        background: isMobile ? "rgba(0,0,0,0.03)" : "transparent",
        border: isMobile ? "none" : "1.5px solid rgba(0,0,0,0.06)",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        transition: "background .2s, color .2s",
    };

    const panelContent = (
        <>
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
        </>
    );

    return (
        <div ref={wrapRef} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={triggerStyle}
                onMouseEnter={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.background = "rgba(194,24,91,0.06)";
                        e.currentTarget.style.color = "#c2185b";
                        e.currentTarget.style.borderColor = "rgba(194,24,91,0.2)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isMobile) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#6b7280";
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                    }
                }}
            >
                <ListChecks size={16} />
                {!isMobile && (
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        برنامه‌های من ({toPersianNum(groups.length)})
                    </span>
                )}
                {!isMobile && <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />}
            </button>

            {open && (isMobile ? (
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            background: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                        }}
                        onClick={() => setOpen(false)}
                    >
                        <div
                            style={{
                                marginTop: "auto",
                                marginBottom: "auto",
                                marginLeft: "auto",
                                marginRight: "auto",
                                width: "calc(100% - 32px)",
                                maxWidth: 380,
                                maxHeight: "85vh",
                                display: "flex",
                                flexDirection: "column",
                                background: "#fff",
                                borderRadius: 20,
                                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                                overflow: "hidden",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 18px 8px",
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ fontSize: 16, fontWeight: 900, color: "#1a1a2e" }}>
                                    برنامه‌های من ({toPersianNum(groups.length)})
                                </span>
                                <button
                                    onClick={() => setOpen(false)}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(0,0,0,0.05)",
                                        border: "none",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        flexShrink: 0,
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div style={{
                                overflowY: "auto",
                                padding: "4px 8px 12px",
                                WebkitOverflowScrolling: "touch",
                            }}>
                                {panelContent}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            ) : (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: 320,
                        maxWidth: "calc(100vw - 32px)",
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
                    {panelContent}
                </div>
            ))}
        </div>
    );
}
