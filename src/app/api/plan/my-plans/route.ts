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

        // Get latest diet plan
        const dietPlan = await prisma.dietPlan.findFirst({
            where: { userId: payload.userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        foodItem: true,
                    },
                    orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                },
            },
        });

        // Get latest workout plan
        const workoutPlan = await prisma.workoutPlan.findFirst({
            where: { userId: payload.userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        exerciseItem: true,
                    },
                    orderBy: [{ day: "asc" }],
                },
            },
        });

        return NextResponse.json({
            success: true,
            dietPlan,
            workoutPlan,
        });
    } catch (error) {
        console.error("My Plans Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}