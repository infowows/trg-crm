import { NextRequest, NextResponse } from "next/server";
import ServiceGroup from "@/models/ServiceGroup";
import dbConnect from "@/lib/dbConnect";

// GET - Lấy chi tiết nhóm dịch vụ
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;

        const serviceGroup = await ServiceGroup.findById(id);

        if (!serviceGroup) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy nhóm dịch vụ" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: serviceGroup,
        });
    } catch (error: any) {
        console.error("Error fetching service group:", error);
        return NextResponse.json(
            { success: false, message: "Không thể tải thông tin nhóm dịch vụ" },
            { status: 500 },
        );
    }
}

// PUT - Cập nhật nhóm dịch vụ
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { name, code, description, isActive } = body;

        // Validation
        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, message: "Tên nhóm dịch vụ là bắt buộc" },
                { status: 400 },
            );
        }

        if (!code || !code.trim()) {
            return NextResponse.json(
                { success: false, message: "Mã nhóm dịch vụ là bắt buộc" },
                { status: 400 },
            );
        }

        // Kiểm tra nhóm dịch vụ tồn tại
        const existingGroup = await ServiceGroup.findById(id);
        if (!existingGroup) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy nhóm dịch vụ" },
                { status: 404 },
            );
        }

        // Kiểm tra mã đã tồn tại ở nhóm khác chưa
        const duplicateGroup = await ServiceGroup.findOne({
            _id: { $ne: id },
            code: code.toUpperCase().trim(),
        });

        if (duplicateGroup) {
            return NextResponse.json(
                { success: false, message: "Mã nhóm dịch vụ đã tồn tại" },
                { status: 400 },
            );
        }

        // Cập nhật nhóm dịch vụ
        const updatedGroup = await ServiceGroup.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                code: code.toUpperCase().trim(),
                description: description?.trim() || "",
                isActive:
                    isActive !== undefined ? isActive : existingGroup.isActive,
            },
            { new: true, runValidators: true },
        );

        return NextResponse.json({
            success: true,
            message: "Cập nhật nhóm dịch vụ thành công",
            data: updatedGroup,
        });
    } catch (error: any) {
        console.error("Error updating service group:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Mã nhóm dịch vụ đã tồn tại" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, message: "Không thể cập nhật nhóm dịch vụ" },
            { status: 500 },
        );
    }
}

// DELETE - Xóa nhóm dịch vụ
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();
        const { id } = await params;

        // TODO: Kiểm tra xem có dịch vụ nào đang sử dụng nhóm này không
        // Nếu có thì không cho xóa

        await ServiceGroup.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Xóa nhóm dịch vụ thành công",
        });
    } catch (error: any) {
        console.error("Error deleting service group:", error);
        return NextResponse.json(
            { success: false, message: "Không thể xóa nhóm dịch vụ" },
            { status: 500 },
        );
    }
}
