import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { requestPayment } from "@/lib/zarinpal";

export async function POST(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { amount, planType } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "کاربر یافت نشد" },
                { status: 404 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const callbackUrl = `${baseUrl}/payment/callback`;

        const result = await requestPayment(
            amount,
            `خرید پلن ${planType} فیت‌بانو`,
            callbackUrl,
            user.phone
        );

        if (!result) {
            return NextResponse.json(
                { success: false, message: "خطا در اتصال به درگاه پرداخت" },
                { status: 500 }
            );
        }

        // Save payment record
        await prisma.payment.create({
            data: {
                userId: user.id,
                amount,
                planType: planType || "monthly",
                zarinpalAuthority: result.authority,
                status: "pending",
            },
        });

        return NextResponse.json({
            success: true,
            paymentUrl: result.paymentUrl,
        });
    } catch (error) {
        console.error("Payment Request Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}