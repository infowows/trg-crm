import { NextRequest, NextResponse } from "next/server";
import CategoryGroup from "@/models/CategoryGroup";
import connectDB from "../../../../lib/dbConnect";


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        
        const categoryGroup = await CategoryGroup.findById(params.id);
        
        if (!categoryGroup) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy nhóm hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: categoryGroup
        });
    } catch (error) {
        console.error("Error fetching category group:", error);
        return NextResponse.json(
            { success: false, error: "Không thể lấy thông tin nhóm hạng mục" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { name, code, note, isActive } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: "Tên và mã nhóm là bắt buộc" },
                { status: 400 }
            );
        }

        // Check if code already exists (excluding current record)
        const existingGroup = await CategoryGroup.findOne({ 
            code: code.toUpperCase(),
            _id: { $ne: params.id }
        });
        
        if (existingGroup) {
            return NextResponse.json(
                { success: false, error: "Mã nhóm đã tồn tại" },
                { status: 400 }
            );
        }

        const categoryGroup = await CategoryGroup.findByIdAndUpdate(
            params.id,
            {
                name: name.trim(),
                code: code.toUpperCase().trim(),
                note: note?.trim() || "",
                isActive: isActive !== undefined ? isActive : true
            },
            { new: true, runValidators: true }
        );

        if (!categoryGroup) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy nhóm hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: categoryGroup,
            message: "Cập nhật nhóm hạng mục thành công"
        });
    } catch (error) {
        console.error("Error updating category group:", error);
        return NextResponse.json(
            { success: false, error: "Không thể cập nhật nhóm hạng mục" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        
        const categoryGroup = await CategoryGroup.findByIdAndDelete(params.id);
        
        if (!categoryGroup) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy nhóm hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa nhóm hạng mục thành công"
        });
    } catch (error) {
        console.error("Error deleting category group:", error);
        return NextResponse.json(
            { success: false, error: "Không thể xóa nhóm hạng mục" },
            { status: 500 }
        );
    }
}
