import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { generateWorkoutPlan } from "@/lib/algorithm";
import { prisma } from "@/lib/prisma";

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

        // Find or create program (race-condition safe)
        const program = await (async () => {
            let p = await prisma.program.findFirst({
                where: { userId: payload.userId, programNumber: num },
            });

            if (!p) {
                try {
                    p = await prisma.program.create({
                        data: { userId: payload.userId, programNumber: num },
                    });
                } catch {
                    p = await prisma.program.findFirst({
                        where: { userId: payload.userId, programNumber: num },
                    });
                }
            }

            return p;
        })();

        if (!program) {
            return NextResponse.json(
                { success: false, message: "خطا در ایجاد برنامه" },
                { status: 500 }
            );
        }

        // Check if workout plan already exists for this program
        const existing = await prisma.workoutPlan.findUnique({
            where: { programId: program.id },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                workoutPlanId: existing.id,
                message: "برنامه ورزشی از قبل وجود دارد",
            });
        }

        const answersCount = await prisma.quizAnswer.count({
            where: { userId: payload.userId },
        });

        if (answersCount === 0) {
            return NextResponse.json(
                { success: false, message: "لطفاً ابتدا کوییز را تکمیل کنید" },
                { status: 400 }
            );
        }

        const workoutPlanId = await generateWorkoutPlan(program.id);

        return NextResponse.json({
            success: true,
            workoutPlanId,
            programNumber: num,
            message: "برنامه ورزشی با موفقیت ساخته شد",
        });
    } catch (error) {
        console.error("Generate Workout Error:", error);
        return NextResponse.json(
            { success: false, message: "خطا در ساخت برنامه ورزشی" },
            { status: 500 }
        );
    }
}
