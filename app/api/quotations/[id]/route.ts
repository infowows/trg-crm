import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Quotation from "../../../../models/Quotation";
import Customer from "../../../../models/Customer";
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

// GET - Lấy chi tiết báo giá
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
    await mongoose.connection.db;

    // Đảm bảo Customer model được đăng ký trước khi populate
    const _ = Customer;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID báo giá không hợp lệ" },
        { status: 400 },
      );
    }

    const quotation = await Quotation.findById(id).populate(
      "customerRef",
      "fullName phone address",
    );

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy báo giá" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error("GET quotation detail error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật báo giá
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
    await mongoose.connection.db;

    const { id } = await params;
    const body = await request.json();
    const { customer, customerRef, packages, status, date, notes } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID báo giá không hợp lệ" },
        { status: 400 },
      );
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy báo giá" },
        { status: 404 },
      );
    }

    // Cập nhật các trường
    if (customer !== undefined) quotation.customer = customer;
    if (customerRef !== undefined) quotation.customerRef = customerRef;
    if (packages !== undefined) quotation.packages = packages;
    if (status !== undefined) quotation.status = status;
    if (date !== undefined) quotation.date = new Date(date);
    if (notes !== undefined) quotation.notes = notes;

    quotation.updatedAt = new Date();
    await quotation.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật báo giá thành công",
      data: quotation,
    });
  } catch (error) {
    console.error("PUT quotation error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// DELETE - Xóa báo giá
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
    await mongoose.connection.db;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID báo giá không hợp lệ" },
        { status: 400 },
      );
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy báo giá" },
        { status: 404 },
      );
    }

    // Kiểm tra trạng thái trước khi xóa
    if (quotation.status === "approved" || quotation.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa báo giá đã được duyệt hoặc hoàn thành",
        },
        { status: 400 },
      );
    }

    await Quotation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa báo giá thành công",
    });
  } catch (error) {
    console.error("DELETE quotation error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
