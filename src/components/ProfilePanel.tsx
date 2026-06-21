"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toPersianDigits } from "@/lib/persian";
import styles from "./ProfilePanel.module.css";

interface UserProfile {
    name: string | null;
    gender: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    targetWeight: number | null;
    goal: string | null;
    activityLevel: string | null;
}

interface ProfilePanelProps {
    open: boolean;
    onClose: () => void;
    phone: string;
    profile: UserProfile;
    quizAnswers: Record<string, string>;
    onSave: (data: Partial<UserProfile>) => Promise<void>;
}

function resolveNum(profileVal: number | null, quizVal: string | undefined): number | null {
    if (profileVal !== null) return profileVal;
    if (quizVal) {
        const n = Number(quizVal);
        if (!isNaN(n)) return n;
    }
    return null;
}

export default function ProfilePanel({ open, onClose, phone, profile, quizAnswers, onSave }: ProfilePanelProps) {
    const initial: UserProfile = {
        name: profile.name,
        gender: profile.gender,
        age: resolveNum(profile.age, quizAnswers["age"]),
        height: resolveNum(profile.height, quizAnswers["height"]),
        weight: resolveNum(profile.weight, quizAnswers["weight"]),
        targetWeight: resolveNum(profile.targetWeight, quizAnswers["targetWeight"]),
        goal: profile.goal || quizAnswers["goal"] || null,
        activityLevel: profile.activityLevel || quizAnswers["activityLevel"] || null,
    };

    const [form, setForm] = useState<UserProfile>(initial);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const merged: UserProfile = {
            name: profile.name,
            gender: profile.gender,
            age: resolveNum(profile.age, quizAnswers["age"]),
            height: resolveNum(profile.height, quizAnswers["height"]),
            weight: resolveNum(profile.weight, quizAnswers["weight"]),
            targetWeight: resolveNum(profile.targetWeight, quizAnswers["targetWeight"]),
            goal: profile.goal || quizAnswers["goal"] || null,
            activityLevel: profile.activityLevel || quizAnswers["activityLevel"] || null,
        };
        setForm(merged);
        setDirty(false);
    }, [profile, quizAnswers]);

    useEffect(() => {
        if (open) {
            panelRef.current?.focus();
        }
    }, [open]);

    const handleChange = (field: string, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
        setDirty(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <>
            <div className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`} onClick={onClose} />
            <div
                ref={panelRef}
                className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label="پروفایل"
            >
                <div className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>پروفایل</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="بستن">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.panelBody}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>شماره موبایل</label>
                        <div className={styles.phoneDisplay} dir="ltr">
                            {toPersianDigits(phone)}
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>نام و نام خانوادگی</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="مثلاً زهرا احمدی"
                            value={form.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>سن</label>
                        <input
                            className={styles.input}
                            type="number"
                            placeholder="مثلاً ۲۸"
                            value={form.age ?? ""}
                            onChange={(e) => handleChange("age", e.target.value ? Number(e.target.value) : null)}
                            min={14}
                            max={70}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>قد (سانتی‌متر)</label>
                            <input
                                className={styles.input}
                                type="number"
                                placeholder="مثلاً ۱۶۵"
                                value={form.height ?? ""}
                                onChange={(e) => handleChange("height", e.target.value ? Number(e.target.value) : null)}
                                min={130}
                                max={210}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>وزن (کیلوگرم)</label>
                            <input
                                className={styles.input}
                                type="number"
                                placeholder="مثلاً ۶۵"
                                value={form.weight ?? ""}
                                onChange={(e) => handleChange("weight", e.target.value ? Number(e.target.value) : null)}
                                min={35}
                                max={200}
                                step={0.1}
                            />
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>وزن هدف</label>
                        <input
                            className={styles.input}
                            type="number"
                            placeholder="مثلاً ۵۸"
                            value={form.targetWeight ?? ""}
                            onChange={(e) => handleChange("targetWeight", e.target.value ? Number(e.target.value) : null)}
                            min={35}
                            max={200}
                            step={0.1}
                        />
                    </div>
                </div>

                <div className={styles.panelFooter}>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={saving || !dirty}
                    >
                        {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                </div>
            </div>
        </>
    );
}
