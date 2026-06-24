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

        const programs = await prisma.program.findMany({
            where: { userId: payload.userId },
            orderBy: { programNumber: "asc" },
            include: {
                dietPlan: {
                    select: { id: true, dailyCalorieTarget: true },
                },
                workoutPlan: {
                    select: { id: true, weeklySplit: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            programs: programs.map((p) => ({
                id: p.id,
                programNumber: p.programNumber,
                createdAt: p.createdAt,
                dietPlan: p.dietPlan,
                workoutPlan: p.workoutPlan,
            })),
        });
    } catch (error) {
        console.error("Programs Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
