import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CareResult from "@/models/CareResult";
import CareGroup from "@/models/CareGroup";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// PUT - Cập nhật kết quả chăm sóc
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
      careGroupRef,
      careGroupName,
      resultName,
      resultCode,
      classification,
      description,
      order,
      active,
    } = body;

    if (!resultName || !classification) {
      return NextResponse.json(
        { success: false, message: "Tên kết quả và xếp loại là bắt buộc" },
        { status: 400 },
      );
    }

    // Check if result exists
    const existingResult = await CareResult.findById(id);
    if (!existingResult) {
      return NextResponse.json(
        { success: false, message: "Kết quả không tồn tại" },
        { status: 404 },
      );
    }

    // If code is changed, check for duplicates
    if (resultCode && resultCode !== existingResult.resultCode) {
      const duplicate = await CareResult.findOne({
        resultCode: resultCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Mã kết quả đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const updatedResult = await CareResult.findByIdAndUpdate(
      id,
      {
        careGroupRef,
        careGroupName,
        resultName,
        resultCode: resultCode?.toUpperCase() || existingResult.resultCode,
        classification,
        description,
        order,
        active,
      },
      { new: true, runValidators: true },
    ).populate("careGroupRef", "name code");

    return NextResponse.json({
      success: true,
      data: updatedResult,
      message: "Cập nhật kết quả thành công",
    });
  } catch (error: any) {
    console.error("PUT care result error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa kết quả chăm sóc
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

    const result = await CareResult.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Kết quả không tồn tại" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa kết quả thành công",
    });
  } catch (error) {
    console.error("DELETE care result error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
