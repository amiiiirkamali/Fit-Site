import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fillMissingDietDays } from "@/lib/algorithm";

export async function GET(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get latest diet plan & fill missing days if needed
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

        if (dietPlan) {
            await fillMissingDietDays(dietPlan.id);
        }

        // Re-fetch after fill
        const filledDietPlan = dietPlan
            ? await prisma.dietPlan.findUnique({
                  where: { id: dietPlan.id },
                  include: {
                      items: {
                          include: { foodItem: true },
                          orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                      },
                  },
              })
            : null;

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
            dietPlan: filledDietPlan,
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