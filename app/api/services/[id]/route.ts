import { NextRequest, NextResponse } from "next/server";
import Service from "@/models/Service";
import dbConnect from "@/lib/dbConnect";

// GET - Lấy chi tiết dịch vụ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dịch vụ" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải thông tin dịch vụ" },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật dịch vụ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { serviceName, code, serviceGroup, description, isActive } = body;

    // Validation
    if (!serviceName || !serviceName.trim()) {
      return NextResponse.json(
        { success: false, message: "Tên dịch vụ là bắt buộc" },
        { status: 400 },
      );
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Mã dịch vụ là bắt buộc" },
        { status: 400 },
      );
    }

    // Kiểm tra dịch vụ tồn tại
    const existingService = await Service.findById(id);
    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dịch vụ" },
        { status: 404 },
      );
    }

    // Kiểm tra mã đã tồn tại ở dịch vụ khác chưa
    const duplicateService = await Service.findOne({
      _id: { $ne: id },
      code: code.toUpperCase().trim(),
    });

    if (duplicateService) {
      return NextResponse.json(
        { success: false, message: "Mã dịch vụ đã tồn tại" },
        { status: 400 },
      );
    }

    // Cập nhật dịch vụ
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        serviceName: serviceName.trim(),
        code: code.toUpperCase().trim(),
        serviceGroup: serviceGroup?.trim(),
        description: description?.trim() || "",
        isActive: isActive !== undefined ? isActive : existingService.isActive,
      },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật dịch vụ thành công",
      data: updatedService,
    });
  } catch (error: any) {
    console.error("Error updating service:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Mã dịch vụ đã tồn tại" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Không thể cập nhật dịch vụ" },
      { status: 500 },
    );
  }
}

// DELETE - Xóa dịch vụ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    // TODO: Kiểm tra xem có bảng giá nào đang sử dụng dịch vụ này không
    // Nếu có thì không cho xóa

    await Service.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa dịch vụ thành công",
    });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa dịch vụ" },
      { status: 500 },
    );
  }
}
