import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeaders } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { fillMissingDietDays } from "@/lib/algorithm";

export async function GET(req: NextRequest) {
    try {
        const payload = getTokenFromHeaders(req.headers);

        if (!payload) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const programNumberParam = searchParams.get("program");
        const dietPlanId = searchParams.get("dietPlanId");
        const workoutPlanId = searchParams.get("workoutPlanId");

        // ── Build planGroups summary (all user's programs) ──
        const programs = await prisma.program.findMany({
            where: { userId: payload.userId },
            orderBy: { programNumber: "desc" },
            include: {
                dietPlan: { select: { id: true } },
                workoutPlan: { select: { id: true } },
            },
        });

        const now = new Date();
        const planGroups = programs.map((p) => ({
            id: p.id,
            programNumber: p.programNumber,
            createdAt: p.createdAt.toISOString(),
            isExpired: now.getTime() - p.createdAt.getTime() > 30 * 24 * 60 * 60 * 1000,
            dietPlan: p.dietPlan ? { id: p.dietPlan.id } : null,
            workoutPlan: p.workoutPlan ? { id: p.workoutPlan.id } : null,
        }));

        // ── Fetch specific plan by dietPlanId ──
        if (dietPlanId) {
            const dp = await prisma.dietPlan.findUnique({
                where: { id: dietPlanId },
                include: {
                    items: {
                        include: { foodItem: true },
                        orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                    },
                },
            });
            if (!dp) {
                return NextResponse.json(
                    { success: false, message: "برنامه غذایی یافت نشد" },
                    { status: 404 }
                );
            }
            await fillMissingDietDays(dp.id);
            const filled = await prisma.dietPlan.findUnique({
                where: { id: dp.id },
                include: {
                    items: {
                        include: { foodItem: true },
                        orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                    },
                },
            });
            const prog = await prisma.program.findUnique({
                where: { id: dp.programId },
                select: { programNumber: true },
            });
            return NextResponse.json({
                success: true,
                planGroups,
                programNumber: prog?.programNumber ?? 0,
                dietPlan: filled,
                workoutPlan: null,
            });
        }

        // ── Fetch specific plan by workoutPlanId ──
        if (workoutPlanId) {
            const wp = await prisma.workoutPlan.findUnique({
                where: { id: workoutPlanId },
                include: {
                    items: {
                        include: { exerciseItem: true },
                        orderBy: [{ day: "asc" }],
                    },
                },
            });
            if (!wp) {
                return NextResponse.json(
                    { success: false, message: "برنامه ورزشی یافت نشد" },
                    { status: 404 }
                );
            }
            const prog = await prisma.program.findUnique({
                where: { id: wp.programId },
                select: { programNumber: true },
            });
            return NextResponse.json({
                success: true,
                planGroups,
                programNumber: prog?.programNumber ?? 0,
                dietPlan: null,
                workoutPlan: wp,
            });
        }

        // ── Fetch by program number ──
        const num = programNumberParam ? parseInt(programNumberParam) : null;

        let target: { programNumber: number; id: string } | null = null;

        if (num !== null) {
            target = await prisma.program.findFirst({
                where: { userId: payload.userId, programNumber: num },
                select: { id: true, programNumber: true },
            });
        }

        // Fallback to latest
        if (!target) {
            const latest = await prisma.program.findFirst({
                where: { userId: payload.userId },
                orderBy: { programNumber: "desc" },
                select: { id: true, programNumber: true },
            });
            if (!latest) {
                return NextResponse.json({
                    success: true,
                    planGroups,
                    dietPlan: null,
                    workoutPlan: null,
                });
            }
            target = latest;
        }

        const dietPlan = await prisma.dietPlan.findUnique({
            where: { programId: target.id },
            include: {
                items: {
                    include: { foodItem: true },
                    orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                },
            },
        });

        if (dietPlan) {
            await fillMissingDietDays(dietPlan.id);
        }

        const filledDietPlan = dietPlan
            ? await prisma.dietPlan.findUnique({
                  where: { id: dietPlan.id },
                  include: {
                      items: {
                          include: { foodItem: true },
                          orderBy: [{ day: "asc" }, { mealSlot: "asc" }],
                      },
                  },
              })
            : null;

        const workoutPlan = await prisma.workoutPlan.findUnique({
            where: { programId: target.id },
            include: {
                items: {
                    include: { exerciseItem: true },
                    orderBy: [{ day: "asc" }],
                },
            },
        });

        return NextResponse.json({
            success: true,
            planGroups,
            programNumber: target.programNumber,
            dietPlan: filledDietPlan,
            workoutPlan,
        });
    } catch (error) {
        console.error("My Plans Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
