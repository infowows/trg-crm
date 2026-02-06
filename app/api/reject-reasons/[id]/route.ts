import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RejectReason from "@/models/RejectReason";
import RejectGroup from "@/models/RejectGroup";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// PUT - Cập nhật lý do từ chối
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
    const {
      rejectGroupRef,
      rejectGroupName,
      name,
      code,
      description,
      order,
      active,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Tên lý do là bắt buộc" },
        { status: 400 },
      );
    }

    // Check if reason exists
    const existingReason = await RejectReason.findById(id);
    if (!existingReason) {
      return NextResponse.json(
        { success: false, message: "Lý do không tồn tại" },
        { status: 404 },
      );
    }

    // If code is changed, check for duplicates
    if (code && code !== existingReason.code) {
      const duplicate = await RejectReason.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Mã lý do đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const updatedReason = await RejectReason.findByIdAndUpdate(
      id,
      {
        rejectGroupRef,
        rejectGroupName,
        name,
        code: code?.toUpperCase() || existingReason.code,
        description,
        order,
        active,
      },
      { new: true, runValidators: true },
    ).populate("rejectGroupRef", "name code");

    return NextResponse.json({
      success: true,
      data: updatedReason,
      message: "Cập nhật lý do thành công",
    });
  } catch (error: any) {
    console.error("PUT reject reason error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa lý do từ chối
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

    const reason = await RejectReason.findByIdAndDelete(id);

    if (!reason) {
      return NextResponse.json(
        { success: false, message: "Lý do không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa lý do thành công",
    });
  } catch (error) {
    console.error("DELETE reject reason error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
