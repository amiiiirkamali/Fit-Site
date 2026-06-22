"use client";

import styles from "./TestimonialCard.module.css";

interface Props {
    title: string;
    quote: string;
    author: string;
    rating: number;
}

export default function TestimonialCard({ title, quote, author, rating }: Props) {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
                        ★
                    </span>
                ))}
            </div>
            <blockquote className={styles.quote}>«{quote}»</blockquote>
            <p className={styles.author}>— {author}</p>
        </div>
    );
}
