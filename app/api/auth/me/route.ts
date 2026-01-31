import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Employee from "../../../../models/Employee";
import { verifyToken } from "../../../../lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy token" },
        { status: 401 },
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    // Connect to MongoDB using Mongoose
    await dbConnect();

    // Find user by ID
    const user = await Employee.findById(decoded.id).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ho_ten: user.fullName,
        phong_ban: user.department || "Chưa cập nhật",
        chuc_vu: user.position || "User",
        so_dien_thoai: user.phone || "",
        dia_chi: user.address || "",
        ngay_sinh: user.dob
          ? new Date(user.dob).toISOString().split("T")[0]
          : "",
        gioi_tinh: user.gender || "Chưa cập nhật",
        phan_quyen: user.role || "user",
        avatar: user.avatar,
        isActive: user.isActive,
        ngay_tao: user.createdAt,
        lan_dang_nhap_cuoi: user.lastLogin || user.updatedAt,
        employeeCode: user.employeeId,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy token" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token không hợp lệ" },
        { status: 401 },
      );
    }

    await dbConnect();
    const body = await request.json();

    const updateData: any = {};
    if (body.ho_ten) updateData.fullName = body.ho_ten;
    if (body.so_dien_thoai) updateData.phone = body.so_dien_thoai;
    if (body.dia_chi) updateData.address = body.dia_chi;
    if (body.ngay_sinh) updateData.dob = new Date(body.ngay_sinh);
    if (body.gioi_tinh) updateData.gender = body.gioi_tinh;

    const user = await Employee.findByIdAndUpdate(
      decoded.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ho_ten: user.fullName,
        phong_ban: user.department || "Chưa cập nhật",
        chuc_vu: user.position || "User",
        so_dien_thoai: user.phone || "",
        dia_chi: user.address || "",
        ngay_sinh: user.dob
          ? new Date(user.dob).toISOString().split("T")[0]
          : "",
        gioi_tinh: user.gender || "Chưa cập nhật",
        phan_quyen: user.role || "user",
        avatar: user.avatar,
        isActive: user.isActive,
        ngay_tao: user.createdAt,
        lan_dang_nhap_cuoi: user.lastLogin || user.updatedAt,
        employeeCode: user.employeeId,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
