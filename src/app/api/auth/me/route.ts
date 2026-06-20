import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                phone: true,
                hasPaid: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Me Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}