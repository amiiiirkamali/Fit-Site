import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
    try {
        const leaderboard = await prisma.cardioLog.groupBy({
            by: ["userId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
        });

        const userIds = leaderboard.map((l) => l.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, phone: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u]));

        const ranked = leaderboard.map((entry, i) => ({
            rank: i + 1,
            userId: entry.userId,
            name: userMap.get(entry.userId)?.name || userMap.get(entry.userId)?.phone || "کاربر",
            count: entry._count.id,
        }));

        return NextResponse.json({ success: true, leaderboard: ranked });
    } catch {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
