import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
    userId: string;
    phone: string;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export function getTokenFromHeaders(
    headers: Headers
): JwtPayload | null {
    const auth = headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return verifyToken(auth.slice(7));
}