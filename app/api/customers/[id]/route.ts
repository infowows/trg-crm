import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import Customer from "@/models/Customer";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

// GET - Lấy chi tiết khách hàng
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

    await clientPromise;
    await mongoose.connection.db;

    // Await params trong Next.js 13+ App Router
    const { id } = await params;

    // Debug logging
    console.log("GET - Received ID:", id);
    console.log("GET - ID type:", typeof id);
    console.log("GET - Params:", await params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("GET - ID validation failed for:", id);
      return NextResponse.json(
        { success: false, message: "ID khách hàng không hợp lệ" },
        { status: 400 },
      );
    }

    const customer = await Customer.findOne({ _id: id, isDel: { $ne: true } });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("GET customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật khách hàng
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

    await clientPromise;
    await mongoose.connection.db;

    // Await params trong Next.js 13+ App Router
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID khách hàng không hợp lệ" },
        { status: 400 },
      );
    }

    const customer = await Customer.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    console.error("PUT customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// DELETE - Xóa khách hàng
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

    await clientPromise;
    await mongoose.connection.db;

    // Await params trong Next.js 13+ App Router
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID khách hàng không hợp lệ" },
        { status: 400 },
      );
    }

    const customer = await Customer.findByIdAndUpdate(id, {
      isDel: true,
      updatedAt: new Date(),
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng hoặc đã bị xóa" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa khách hàng thành công",
    });
  } catch (error) {
    console.error("DELETE customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
