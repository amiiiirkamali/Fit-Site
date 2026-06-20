"use client";

import { useRef, useEffect } from "react";
import styles from "./OtpInput.module.css";

interface Props {
    length: number;
    value: string;
    onChange: (val: string) => void;
}

export default function OtpInput({ length, value, onChange }: Props) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (idx: number, char: string) => {
        if (!/^\d?$/.test(char)) return;
        const arr = value.split("");
        arr[idx] = char;
        const newVal = arr.join("").slice(0, length);
        onChange(newVal);
        if (char && idx < length - 1) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    return (
        <div className={styles.wrapper} dir="ltr">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    className={styles.box}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                />
            ))}
        </div>
    );
}