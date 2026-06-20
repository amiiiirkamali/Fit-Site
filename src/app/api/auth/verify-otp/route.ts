import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json(
                { success: false, message: "شماره و کد الزامی است" },
                { status: 400 }
            );
        }

        // Verify OTP from Redis
        const storedCode = await redis.get(`otp:${phone}`);

        if (!storedCode || storedCode !== code) {
            return NextResponse.json(
                { success: false, message: "کد وارد شده اشتباه است یا منقضی شده" },
                { status: 400 }
            );
        }

        // Delete OTP after verification
        await redis.del(`otp:${phone}`);

        // Find or create user
        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    isVerified: true,
                },
            });
        } else {
            await prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true },
            });
        }

        // Generate JWT
        const token = signToken({ userId: user.id, phone: user.phone });

        return NextResponse.json({
            success: true,
            token,
            hasPaid: user.hasPaid,
            message: "ورود موفق",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}