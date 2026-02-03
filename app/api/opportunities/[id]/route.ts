import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Opportunity from "../../../../models/Opportunity";
import Customer from "../../../../models/Customer"; // Cần thiết để populate
import CustomerCare from "../../../../models/CustomerCare"; // Cần thiết để populate
import { verifyToken } from "../../../../lib/auth";
import mongoose from "mongoose";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

// GET - Chi tiết cơ hội
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 },
      );
    }

    const opportunity = await Opportunity.findById(id)
      .populate("customerRef")
      .populate("careHistory");

    if (!opportunity) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy cơ hội" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error("GET opportunity detail error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật cơ hội
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 },
      );
    }

    const opportunity = await Opportunity.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy cơ hội" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      data: opportunity,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa cơ hội
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 },
      );
    }

    const opportunity = await Opportunity.findByIdAndDelete(id);

    if (!opportunity) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy cơ hội" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
