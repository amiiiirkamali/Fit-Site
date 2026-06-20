"use client";

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
    return (
        <div className={styles.wrapper}>
            <input
                type="number"
                inputMode="numeric"
                className={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {unit && <span className={styles.unit}>{unit}</span>}
        </div>
    );
}