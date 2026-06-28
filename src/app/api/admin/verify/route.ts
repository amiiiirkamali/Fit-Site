import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { key } = await req.json();

        if (key === process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { success: false, message: "کلید نادرست است" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "خطای سرور" },
            { status: 500 }
        );
    }
}
