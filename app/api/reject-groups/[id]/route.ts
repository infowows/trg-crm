import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RejectGroup from "@/models/RejectGroup";
import RejectReason from "@/models/RejectReason";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// PUT - Cập nhật nhóm lý do từ chối
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
    const existingGroup = await RejectGroup.findById(id);
    if (!existingGroup) {
      return NextResponse.json(
        { success: false, message: "Nhóm lý do không tồn tại" },
        { status: 404 },
      );
    }

    // If code is changed, check for duplicates
    if (code && code !== existingGroup.code) {
      const duplicate = await RejectGroup.findOne({
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

    const updatedGroup = await RejectGroup.findByIdAndUpdate(
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

    // Also update group name in all linked reasons if name changed
    if (name !== existingGroup.name) {
      await RejectReason.updateMany(
        { rejectGroupRef: id },
        { rejectGroupName: name },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: "Cập nhật nhóm lý do thành công",
    });
  } catch (error: any) {
    console.error("PUT reject group error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa nhóm lý do từ chối
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

    // Check if group has linked reasons
    const linkedReasonsCount = await RejectReason.countDocuments({
      rejectGroupRef: id,
    });
    if (linkedReasonsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Không thể xóa nhóm đã có lý do chi tiết. Hãy xóa các lý do trước.",
        },
        { status: 400 },
      );
    }

    const group = await RejectGroup.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json(
        { success: false, message: "Nhóm lý do không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa nhóm lý do thành công",
    });
  } catch (error) {
    console.error("DELETE reject group error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
