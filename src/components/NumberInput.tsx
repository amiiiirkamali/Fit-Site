"use client";

import { toPersianDigits, toEnglishDigits } from "@/lib/persian";
import styles from "./NumberInput.module.css";

interface Props {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    unit?: string;
    min?: number;
    max?: number;
}

export default function NumberInput({
                                        value,
                                        onChange,
                                        placeholder,
                                        unit,
                                    }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const cleaned = raw.replace(/[^\d۰-۹]/g, "");
        const english = toEnglishDigits(cleaned);
        onChange(english);
    };

    return (
        <div className={styles.wrapper}>
            <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={toPersianDigits(value)}
                onChange={handleChange}
                placeholder={placeholder && toPersianDigits(placeholder)}
            />
            {unit && <span className={styles.unit}>{toPersianDigits(unit)}</span>}
        </div>
    );
}
