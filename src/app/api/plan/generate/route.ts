import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
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

        const dietPlanId = await generateDietPlan(payload.userId);
        const workoutPlanId = await generateWorkoutPlan(payload.userId);

        return NextResponse.json({
            success: true,
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