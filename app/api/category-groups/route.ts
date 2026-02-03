import { NextRequest, NextResponse } from "next/server";
import CategoryGroup from "@/models/CategoryGroup";
import connectDB from "../../../lib/dbConnect";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [categoryGroups, total] = await Promise.all([
      CategoryGroup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CategoryGroup.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: categoryGroups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching category groups:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách nhóm hạng mục" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, note } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Tên nhóm là bắt buộc" },
        { status: 400 },
      );
    }

    // Tự động tạo mã nhóm: NHM-0001
    const count = await CategoryGroup.countDocuments();
    const code = `NHM-${String(count + 1).padStart(4, "0")}`;

    const categoryGroup = new CategoryGroup({
      name: name.trim(),
      code,
      note: note?.trim() || "",
    });

    await categoryGroup.save();

    return NextResponse.json({
      success: true,
      data: categoryGroup,
      message: "Tạo nhóm hạng mục thành công",
    });
  } catch (error) {
    console.error("Error creating category group:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo nhóm hạng mục" },
      { status: 500 },
    );
  }
}
