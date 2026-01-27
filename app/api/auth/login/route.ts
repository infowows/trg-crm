import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/auth";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        console.log("🔐 Login API called");

        const body = await request.json();
        console.log("📝 Request body:", {
            username: body.username,
            password: body.password ? "***" : "missing",
        });

        const { username, password } = body;

        if (!username || !password) {
            console.log("❌ Missing username or password");
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập tên đăng nhập và mật khẩu",
                },
                { status: 400 },
            );
        }

        // Connect to MongoDB using Mongoose
        console.log("📡 Connecting to MongoDB...");
        await dbConnect();
        console.log("✅ MongoDB connected via Mongoose");

        // Find user by username (same as backend logic)
        console.log("🔍 Finding user:", username);
        const user = await User.findOne({ username }).lean();
        console.log("👤 User found:", user ? "yes" : "no");

        if (!user) {
            console.log("❌ User not found");
            return NextResponse.json(
                {
                    success: false,
                    message: "Tên đăng nhập hoặc mật khẩu không đúng",
                },
                { status: 401 },
            );
        }

        console.log("🔑 Comparing password (plain text)...");
        // Simple password comparison (same as backend logic - line 23)
        if (user.password !== password) {
            console.log("❌ Invalid password");
            return NextResponse.json(
                {
                    success: false,
                    message: "Tên đăng nhập hoặc mật khẩu không đúng",
                },
                { status: 401 },
            );
        }

        console.log("✅ Authentication successful");
        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            email: user.email || "",
            ho_ten: user.fullname || "",
            phong_ban: user.phongBan || "",
            chuc_vu: user.chucVu || "",
            phan_quyen: "User",
        });

        console.log("🎟️ Token generated");

        const response = NextResponse.json({
            success: true,
            message: "Đăng nhập thành công",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ho_ten: user.fullname,
                phong_ban: user.phongBan,
                chuc_vu: user.chucVu,
                phan_quyen: "User",
            },
            token,
        });

        // Set HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        console.log("🍪 Cookie set");
        return response;
    } catch (error) {
        console.error("💥 Login error:", error);
        console.error(
            "💥 Error stack:",
            error instanceof Error ? error.stack : "No stack trace",
        );
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
