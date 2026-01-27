import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import Department from "@/models/Department";
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

// GET - Lấy chi tiết phòng ban
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
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

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID phòng ban không hợp lệ" },
                { status: 400 },
            );
        }

        const department = await Department.findById(id)
            .populate("manager", "fullName email position")
            .select(
                "_id name description isActive manager employeeCount createdAt updatedAt",
            );

        if (!department) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy phòng ban" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: department,
        });
    } catch (error) {
        console.error("GET department error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// PUT - Cập nhật phòng ban
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
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

        const { id } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID phòng ban không hợp lệ" },
                { status: 400 },
            );
        }

        const { name, description, manager, isActive } = body;

        // Validation
        if (!name || name.trim() === "") {
            return NextResponse.json(
                { success: false, message: "Tên phòng ban là bắt buộc" },
                { status: 400 },
            );
        }

        // Check duplicate name (excluding current department)
        const existingDepartment = await Department.findOne({
            _id: { $ne: id },
            name: name.trim(),
            isActive: true,
        });

        if (existingDepartment) {
            return NextResponse.json(
                { success: false, message: "Tên phòng ban đã tồn tại" },
                { status: 400 },
            );
        }

        const department = await Department.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description?.trim() || "",
                manager: manager || null,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true },
        ).populate("manager", "fullName email position");

        if (!department) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy phòng ban" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Cập nhật phòng ban thành công",
            data: department,
        });
    } catch (error) {
        console.error("PUT department error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// DELETE - Xóa phòng ban
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
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

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID phòng ban không hợp lệ" },
                { status: 400 },
            );
        }

        // Soft delete - set isActive to false
        const department = await Department.findByIdAndUpdate(
            id,
            {
                isActive: false,
                updatedAt: new Date(),
            },
            { new: true },
        );

        if (!department) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy phòng ban" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa phòng ban thành công",
        });
    } catch (error) {
        console.error("DELETE department error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
