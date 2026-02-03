import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import CategoryItem from "../../../../models/CategoryItem";
import CategoryGroup from "../../../../models/CategoryGroup";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    const categoryItem = await CategoryItem.findById(id).populate(
      "groupId",
      "name code",
    );

    if (!categoryItem) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy hạng mục" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryItem,
    });
  } catch (error) {
    console.error("Error fetching category item:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy thông tin hạng mục" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { groupId, name, note, isActive } = body;

    if (!groupId || !name) {
      return NextResponse.json(
        { success: false, error: "Nhóm và tên hạng mục là bắt buộc" },
        { status: 400 },
      );
    }

    const categoryItem = await CategoryItem.findByIdAndUpdate(
      id,
      {
        groupId,
        name: name.trim(),
        note: note?.trim() || "",
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true },
    );

    if (!categoryItem) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy hạng mục" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryItem,
      message: "Cập nhật hạng mục thành công",
    });
  } catch (error) {
    console.error("Error updating category item:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật hạng mục" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    const categoryItem = await CategoryItem.findByIdAndDelete(id);

    if (!categoryItem) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy hạng mục" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa hạng mục thành công",
    });
  } catch (error) {
    console.error("Error deleting category item:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa hạng mục" },
      { status: 500 },
    );
  }
}
