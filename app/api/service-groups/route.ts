import { NextRequest, NextResponse } from "next/server";
import ServiceGroup from "@/models/ServiceGroup";
import dbConnect from "@/lib/dbConnect";

// GET - Lấy danh sách nhóm dịch vụ
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const query: any = {};

    // Tìm kiếm theo tên hoặc mã
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo trạng thái
    if (status !== "all") {
      query.isActive = status === "active";
    }

    const skip = (page - 1) * limit;

    const [serviceGroups, total] = await Promise.all([
      ServiceGroup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ServiceGroup.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: serviceGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching service groups:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải danh sách nhóm dịch vụ" },
      { status: 500 },
    );
  }
}

// POST - Tạo nhóm dịch vụ mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, isActive } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Tên nhóm dịch vụ là bắt buộc" },
        { status: 400 },
      );
    }

    // Tự động tạo mã nhóm dịch vụ (SG-XXXX)
    const lastGroup = await ServiceGroup.findOne({}, { code: 1 }).sort({
      code: -1,
    });
    let newCode = "SG-0001";

    if (lastGroup && lastGroup.code && lastGroup.code.startsWith("SG-")) {
      const currentNumber = parseInt(lastGroup.code.replace("SG-", ""));
      if (!isNaN(currentNumber)) {
        newCode = `SG-${(currentNumber + 1).toString().padStart(4, "0")}`;
      }
    } else if (lastGroup && lastGroup.code) {
      // Trường hợp có dữ liệu cũ không đúng format SG-
      const count = await ServiceGroup.countDocuments();
      newCode = `SG-${(count + 1).toString().padStart(4, "0")}`;
    }

    // Tạo nhóm dịch vụ mới
    const serviceGroup = new ServiceGroup({
      name: name.trim(),
      code: newCode,
      description: description?.trim() || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    await serviceGroup.save();

    return NextResponse.json({
      success: true,
      message: "Tạo nhóm dịch vụ thành công",
      data: serviceGroup,
    });
  } catch (error: any) {
    console.error("Error creating service group:", error);

    return NextResponse.json(
      { success: false, message: "Không thể tạo nhóm dịch vụ mới" },
      { status: 500 },
    );
  }
}
