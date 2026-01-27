import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Position from "../../../../models/Position";
import { verifyToken } from "../../../../lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy chi tiết chức vụ
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

        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID chức vụ không hợp lệ" },
                { status: 400 },
            );
        }

        const position = await Position.findById(id);

        if (!position) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy chức vụ" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: position,
        });
    } catch (error) {
        console.error("GET position error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// PUT - Cập nhật chức vụ
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

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID chức vụ không hợp lệ" },
                { status: 400 },
            );
        }

        const position = await Position.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: true },
        );

        if (!position) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy chức vụ" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Cập nhật chức vụ thành công",
            data: position,
        });
    } catch (error) {
        console.error("PUT position error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// DELETE - Xóa chức vụ
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

        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "ID chức vụ không hợp lệ" },
                { status: 400 },
            );
        }

        const position = await Position.findByIdAndDelete(id);

        if (!position) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy chức vụ" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa chức vụ thành công",
        });
    } catch (error) {
        console.error("DELETE position error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
