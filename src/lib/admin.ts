import { getTokenFromHeaders } from "./jwt";

const ADMIN_PHONES = ["09190337538", "09127371154"];

export function checkAdminAuth(headers: Headers): {
    authorized: boolean;
    message?: string;
    phone?: string;
    userId?: string;
} {
    const payload = getTokenFromHeaders(headers);
    if (!payload) {
        return { authorized: false, message: "Unauthorized" };
    }
    if (!ADMIN_PHONES.includes(payload.phone)) {
        return { authorized: false, message: "دسترسی غیرمجاز" };
    }
    return { authorized: true, phone: payload.phone, userId: payload.userId };
}

export { ADMIN_PHONES };
