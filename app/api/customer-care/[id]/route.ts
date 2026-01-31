import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import CustomerCare from "../../../../models/CustomerCare";
import { verifyToken } from "../../../../lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

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

    // Tìm kiếm theo _id hoặc careId
    const customerCare = await CustomerCare.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { careId: id }],
    });

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customerCare,
    });
  } catch (error) {
    console.error("Error fetching customer care detail:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy thông tin kế hoạch CSKH" },
      { status: 500 },
    );
  }
}

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

    const customerCare = await CustomerCare.findOneAndUpdate(
      {
        $or: [
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { careId: id },
        ],
      },
      body,
      { new: true, runValidators: true },
    );

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật kế hoạch CSKH thành công",
      data: customerCare,
    });
  } catch (error: any) {
    console.error("Error updating customer care:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi khi cập nhật kế hoạch CSKH",
      },
      { status: 500 },
    );
  }
}

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

    const customerCare = await CustomerCare.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { careId: id }],
    });

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa kế hoạch CSKH thành công",
    });
  } catch (error) {
    console.error("Error deleting customer care:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa kế hoạch CSKH" },
      { status: 500 },
    );
  }
}
