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

        const food = await prisma.foodItem.create({
            data: {
                name: data.name,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat,
                mealType: data.mealType,
                dietaryTags: data.dietaryTags || [],
                description: data.description,
                imageUrl: data.imageUrl,
            },
        });

        return NextResponse.json({ success: true, food });
    } catch (error) {
        console.error("Admin Food Error:", error);
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

        const foods = await prisma.foodItem.findMany({
            orderBy: { mealType: "asc" },
        });

        return NextResponse.json({ success: true, foods });
    } catch (error) {
        console.error("Admin Food Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}