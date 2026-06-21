const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(str: string): string {
    return str.replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toEnglishDigits(str: string): string {
    return str.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}
