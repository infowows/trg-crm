import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Position from "../../../models/Position";
import { verifyToken } from "../../../lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy danh sách chức vụ
export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await dbConnect();
        await mongoose.connection.db;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const isActive = searchParams.get("isActive");
        const department = searchParams.get("department");

        const query: any = {};

        if (search) {
            query.$or = [
                { positionName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { department: { $regex: search, $options: "i" } },
            ];
        }

        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        if (department) {
            query.department = department;
        }

        const skip = (page - 1) * limit;

        const [positions, total] = await Promise.all([
            Position.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Position.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: positions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET positions error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// POST - Thêm chức vụ mới
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await dbConnect();
        await mongoose.connection.db;

        const body = await request.json();
        const { positionName, description, department } = body;

        if (!positionName) {
            return NextResponse.json(
                { success: false, message: "Vui lòng nhập tên chức vụ" },
                { status: 400 },
            );
        }

        const position = new Position({
            positionName,
            description,
            department,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await position.save();

        return NextResponse.json({
            success: true,
            message: "Thêm chức vụ thành công",
            data: position,
        });
    } catch (error) {
        console.error("POST position error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
