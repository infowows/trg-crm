import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import CategoryItem from "../../../../models/CategoryItem";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        
        const categoryItem = await CategoryItem.findById(params.id);
        
        if (!categoryItem) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: categoryItem
        });
    } catch (error) {
        console.error("Error fetching category item:", error);
        return NextResponse.json(
            { success: false, error: "Không thể lấy thông tin hạng mục" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        
        const body = await request.json();
        const { name, code, note, isActive } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: "Tên và mã hạng mục là bắt buộc" },
                { status: 400 }
            );
        }

        // Check if code already exists (excluding current record)
        const existingItem = await CategoryItem.findOne({ 
            code: code.toUpperCase(),
            _id: { $ne: params.id }
        });
        
        if (existingItem) {
            return NextResponse.json(
                { success: false, error: "Mã hạng mục đã tồn tại" },
                { status: 400 }
            );
        }

        const categoryItem = await CategoryItem.findByIdAndUpdate(
            params.id,
            {
                name: name.trim(),
                code: code.toUpperCase().trim(),
                note: note?.trim() || "",
                isActive: isActive !== undefined ? isActive : true
            },
            { new: true, runValidators: true }
        );

        if (!categoryItem) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: categoryItem,
            message: "Cập nhật hạng mục thành công"
        });
    } catch (error) {
        console.error("Error updating category item:", error);
        return NextResponse.json(
            { success: false, error: "Không thể cập nhật hạng mục" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        
        const categoryItem = await CategoryItem.findByIdAndDelete(params.id);
        
        if (!categoryItem) {
            return NextResponse.json(
                { success: false, error: "Không tìm thấy hạng mục" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa hạng mục thành công"
        });
    } catch (error) {
        console.error("Error deleting category item:", error);
        return NextResponse.json(
            { success: false, error: "Không thể xóa hạng mục" },
            { status: 500 }
        );
    }
}
