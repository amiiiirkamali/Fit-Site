import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const allowedFields = [
            "name", "gender", "age", "height", "weight",
            "targetWeight", "goal", "activityLevel",
        ];

        const updateData: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: "هیچ فیلدی برای بروزرسانی ارسال نشده" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
            select: {
                id: true,
                phone: true,
                hasPaid: true,
                name: true,
                gender: true,
                age: true,
                height: true,
                weight: true,
                targetWeight: true,
                goal: true,
                activityLevel: true,
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
