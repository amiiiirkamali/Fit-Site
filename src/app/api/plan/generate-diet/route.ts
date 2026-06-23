import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { generateDietPlan } from "@/lib/algorithm";
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

        const existing = await prisma.dietPlan.findFirst({
            where: { userId: payload.userId },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                dietPlanId: existing.id,
                message: "برنامه از قبل وجود دارد",
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

        const dietPlanId = await generateDietPlan(payload.userId);

        return NextResponse.json({
            success: true,
            dietPlanId,
            message: "برنامه غذایی با موفقیت ساخته شد",
        });
    } catch (error) {
        console.error("Generate Diet Error:", error);
        return NextResponse.json(
            { success: false, message: "خطا در ساخت برنامه غذایی" },
            { status: 500 }
        );
    }
}
