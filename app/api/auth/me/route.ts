import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { verifyToken } from "../../../../lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy token" },
                { status: 401 },
            );
        }

        // Verify JWT token
        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Token không hợp lệ" },
                { status: 401 },
            );
        }

        // Connect to MongoDB using Mongoose
        await dbConnect();

        // Find user by ID (same as backend logic - line 50)
        const user = await User.findById(decoded.id).lean();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy người dùng" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ho_ten: user.fullname,
                phong_ban: user.phongBan,
                chuc_vu: user.chucVu,
                phan_quyen: "User",
                avatar: user.avatar,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
