import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/sms";

export async function POST(req: NextRequest) {
    try {
        const { phone, source } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json(
                { success: false, message: "شماره موبایل معتبر وارد کنید" },
                { status: 400 }
            );
        }

        // Look up user to check payment status
        const user = await prisma.user.findUnique({ where: { phone } });
        const userExists = !!user;
        const hasPaid = user?.hasPaid ?? false;

        // If user hasn't paid (or is new in login flow), skip OTP
        if ((source === "login" && !hasPaid) || (userExists && !hasPaid)) {
            return NextResponse.json({
                success: false,
                code: "NOT_PAID",
                message: "هنوز خریدی ثبت نشده. برای شروع برنامه کلیک کنید.",
            });
        }

        // Check rate limit
        const rateKey = `otp:rate:${phone}`;
        const rateCount = await redis.get(rateKey);
        if (rateCount && parseInt(rateCount) > 20) {
            return NextResponse.json(
                { success: false, message: "تعداد درخواست‌ها بیش از حد مجاز" },
                { status: 429 }
            );
        }

        // Generate OTP
        const code =
            process.env.TEST_OTP_CODE ||
            Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis (5 min expiry)
        await redis.set(`otp:${phone}`, code, "EX", 300);

        // Rate limiting
        await redis.incr(rateKey);
        await redis.expire(rateKey, 3600);

        // Send SMS
        const sent = await sendOtp(phone, code);

        if (process.env.MOCK_SMS === "1") {
            return NextResponse.json({
                success: true,
                message: "کد تأیید ارسال شد",
                code, // Only in mock mode
            });
        }

        return NextResponse.json({
            success: sent,
            message: sent ? "کد تأیید ارسال شد" : "خطا در ارسال پیامک",
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}