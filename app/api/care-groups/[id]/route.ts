import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CareGroup from "@/models/CareGroup";
import CareResult from "@/models/CareResult";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// PUT - Cập nhật nhóm chăm sóc
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, code, description, order, active } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Tên nhóm là bắt buộc" },
        { status: 400 },
      );
    }

    // Check if group exists
    const existingGroup = await CareGroup.findById(id);
    if (!existingGroup) {
      return NextResponse.json(
        { success: false, message: "Nhóm chăm sóc không tồn tại" },
        { status: 404 },
      );
    }

    // If code is changed, check for duplicates
    if (code && code !== existingGroup.code) {
      const duplicate = await CareGroup.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Mã nhóm đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const updatedGroup = await CareGroup.findByIdAndUpdate(
      id,
      {
        name,
        code: code?.toUpperCase() || existingGroup.code,
        description,
        order,
        active,
      },
      { new: true, runValidators: true },
    );

    // Also update group name in all linked results if name changed
    if (name !== existingGroup.name) {
      await CareResult.updateMany(
        { careGroupRef: id },
        { careGroupName: name },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: "Cập nhật nhóm chăm sóc thành công",
    });
  } catch (error: any) {
    console.error("PUT care group error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa nhóm chăm sóc
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    // Check if group has linked results
    const linkedResultsCount = await CareResult.countDocuments({
      careGroupRef: id,
    });
    if (linkedResultsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Không thể xóa nhóm đã có kết quả chi tiết. Hãy xóa các kết quả trước.",
        },
        { status: 400 },
      );
    }

    const group = await CareGroup.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Nhóm chăm sóc không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa nhóm chăm sóc thành công",
    });
  } catch (error) {
    console.error("DELETE care group error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
