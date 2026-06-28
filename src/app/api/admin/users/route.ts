import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin";

function isAuthorized(req: NextRequest): boolean {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey === process.env.ADMIN_SECRET_KEY) return true;
    const auth = checkAdminAuth(req.headers);
    return auth.authorized;
}

export async function GET(req: NextRequest) {
    try {
        if (!isAuthorized(req)) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                quizAnswers: {
                    select: { questionKey: true, answerValue: true },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                },
                programs: {
                    orderBy: { programNumber: "desc" },
                    include: {
                        dietPlan: {
                            include: {
                                items: {
                                    include: {
                                        foodItem: true,
                                    },
                                },
                            },
                        },
                        workoutPlan: {
                            include: {
                                items: {
                                    include: {
                                        exerciseItem: true,
                                    },
                                },
                            },
                        },
                    },
                },
                cardioLogs: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("Admin Users Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
