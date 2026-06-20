import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";

export async function POST(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { authority } = await req.json();

        if (!authority) {
            return NextResponse.json(
                { success: false, message: "Authority الزامی است" },
                { status: 400 }
            );
        }

        // Find the payment record
        const payment = await prisma.payment.findFirst({
            where: {
                userId: payload.userId,
                zarinpalAuthority: authority,
                status: "pending",
            },
        });

        if (!payment) {
            return NextResponse.json(
                { success: false, message: "تراکنش یافت نشد" },
                { status: 404 }
            );
        }

        // Verify with Zarinpal
        const result = await verifyPayment(authority, payment.amount);

        if (!result || !result.success) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "failed" },
            });

            return NextResponse.json(
                { success: false, message: "پرداخت تأیید نشد" },
                { status: 400 }
            );
        }

        // Update payment and user
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "success",
                zarinpalRefId: result.refId,
            },
        });

        await prisma.user.update({
            where: { id: payload.userId },
            data: { hasPaid: true },
        });

        return NextResponse.json({
            success: true,
            refId: result.refId,
            message: "پرداخت موفق",
        });
    } catch (error) {
        console.error("Payment Verify Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}