import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";
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

        // Atomically claim this payment — prevents duplicate processing
        // when Zarinpal sends two simultaneous callbacks
        const claim = await prisma.payment.updateMany({
            where: { id: payment.id, status: "pending" },
            data: { status: "processing" },
        });

        if (claim.count === 0) {
            return NextResponse.json({
                success: true,
                message: "پرداخت قبلاً پردازش شده است",
            });
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

        // Update payment
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

        // Get the last program number
        const lastProgram = await prisma.program.findFirst({
            where: { userId: payload.userId },
            orderBy: { programNumber: "desc" },
        });
        let nextNumber = (lastProgram?.programNumber ?? 0) + 1;

        // Create programsCount programs, each with diet + workout plans
        const createdPrograms: { programNumber: number; dietPlanId: string; workoutPlanId: string }[] = [];
        const count = payment.programsCount;

        for (let i = 0; i < count; i++) {
            const program = await prisma.program.create({
                data: {
                    userId: payload.userId,
                    programNumber: nextNumber + i,
                },
            });

            let dietPlanId: string | null = null;
            let workoutPlanId: string | null = null;

            try {
                dietPlanId = await generateDietPlan(program.id);
            } catch (e) {
                console.error(`Diet plan generation failed for program ${program.programNumber}:`, e);
            }

            try {
                workoutPlanId = await generateWorkoutPlan(program.id);
            } catch (e) {
                console.error(`Workout plan generation failed for program ${program.programNumber}:`, e);
            }

            createdPrograms.push({
                programNumber: program.programNumber,
                dietPlanId: dietPlanId ?? "",
                workoutPlanId: workoutPlanId ?? "",
            });
        }

        return NextResponse.json({
            success: true,
            refId: result.refId,
            message: `پرداخت موفق — ${count} برنامه ساخته شد`,
            programs: createdPrograms,
        });
    } catch (error) {
        console.error("Payment Verify Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}