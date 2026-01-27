import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy danh sách nhân viên theo phòng ban
export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await clientPromise;
        await mongoose.connection.db;

        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get("departmentId");

        // Build query
        let query = { isActive: true };

        // Nếu có departmentId, thêm vào query
        // if (departmentId && departmentId !== "all") {
        //     query = {
        //         ...query,
        //         department: departmentId,
        //     };
        // }

        const users = await User.find(query)
            .select("_id fullName email department isActive")
            .sort({ fullName: 1 });

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error("GET users error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
