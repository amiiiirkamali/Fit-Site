import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);
        if (!payload) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { exerciseId, day, completed } = await req.json();
        if (!exerciseId || !day) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        if (completed) {
            await prisma.cardioLog.upsert({
                where: { userId_exerciseId_day: { userId: payload.userId, exerciseId, day } },
                update: {},
                create: { userId: payload.userId, exerciseId, day },
            });
        } else {
            await prisma.cardioLog.deleteMany({
                where: { userId: payload.userId, exerciseId, day },
            });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
