import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth } from "@/lib/admin";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminKey = req.headers.get("x-admin-key");
        const auth = adminKey === process.env.ADMIN_SECRET_KEY
            ? { authorized: true }
            : checkAdminAuth(req.headers);

        if (!auth.authorized) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = params;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "کاربر یافت نشد" },
                { status: 404 }
            );
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "کاربر با تمام اطلاعات حذف شد" });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
