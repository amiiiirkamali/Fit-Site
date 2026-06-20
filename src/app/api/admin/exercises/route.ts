import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const adminKey = req.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await req.json();

        const exercise = await prisma.exerciseItem.create({
            data: {
                name: data.name,
                muscleGroup: data.muscleGroup,
                equipment: data.equipment,
                difficulty: data.difficulty,
                sets: data.sets || 3,
                reps: data.reps || "12",
                description: data.description,
                gifUrl: data.gifUrl,
            },
        });

        return NextResponse.json({ success: true, exercise });
    } catch (error) {
        console.error("Admin Exercise Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const adminKey = req.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const exercises = await prisma.exerciseItem.findMany({
            orderBy: { muscleGroup: "asc" },
        });

        return NextResponse.json({ success: true, exercises });
    } catch (error) {
        console.error("Admin Exercise Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}