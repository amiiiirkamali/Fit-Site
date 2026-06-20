import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
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

        const { answers } = await req.json();

        if (!answers || typeof answers !== "object") {
            return NextResponse.json(
                { success: false, message: "پاسخ‌ها الزامی هستند" },
                { status: 400 }
            );
        }

        // Upsert quiz answers
        const upserts = Object.entries(answers).map(([key, value]) =>
            prisma.quizAnswer.upsert({
                where: {
                    userId_questionKey: {
                        userId: payload.userId,
                        questionKey: key,
                    },
                },
                update: { answerValue: String(value) },
                create: {
                    userId: payload.userId,
                    questionKey: key,
                    answerValue: String(value),
                },
            })
        );

        await Promise.all(upserts);

        return NextResponse.json({
            success: true,
            message: "پاسخ‌ها ذخیره شد",
        });
    } catch (error) {
        console.error("Quiz Submit Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}