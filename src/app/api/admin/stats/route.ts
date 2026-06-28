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

        const [
            totalUsers,
            paidUsers,
            verifiedUsers,
            totalPrograms,
            totalPayments,
            todayUsers,
            totalFoods,
            totalExercises,
            totalCardioLogs,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { hasPaid: true } }),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.program.count(),
            prisma.payment.aggregate({ _sum: { amount: true } }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            prisma.foodItem.count(),
            prisma.exerciseItem.count(),
            prisma.cardioLog.count(),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                paidUsers,
                verifiedUsers,
                totalPrograms,
                totalPaymentsAmount: totalPayments._sum.amount || 0,
                todayUsers,
                totalFoods,
                totalExercises,
                totalCardioLogs,
            },
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
