import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { generateDietPlan, generateWorkoutPlan } from "@/lib/algorithm";

export async function POST(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { programNumber } = await req.json();
        const num = programNumber || 1;

        // Find or create program
        let program = await prisma.program.findFirst({
            where: { userId: payload.userId, programNumber: num },
        });

        if (!program) {
            program = await prisma.program.create({
                data: { userId: payload.userId, programNumber: num },
            });
        }

        const dietPlanId = await generateDietPlan(program.id);
        const workoutPlanId = await generateWorkoutPlan(program.id);

        return NextResponse.json({
            success: true,
            programNumber: num,
            dietPlanId,
            workoutPlanId,
            message: "برنامه‌ها با موفقیت ساخته شدند",
        });
    } catch (error) {
        console.error("Plan Generate Error:", error);
        return NextResponse.json(
            { success: false, message: "خطا در ساخت برنامه" },
            { status: 500 }
        );
    }
}