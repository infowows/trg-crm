import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CategoryItem from "../../../models/CategoryItem";
import CategoryGroup from "../../../models/CategoryGroup";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const groupId = searchParams.get("groupId");

    const query: any = {};

    if (groupId) {
      query.groupId = groupId;
    }

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

    const [data, total] = await Promise.all([
      CategoryItem.find(query)
        .populate("groupId", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CategoryItem.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching category items:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách hạng mục" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { groupId, name, note } = body;

    if (!groupId || !name) {
      return NextResponse.json(
        { success: false, error: "Nhóm và tên hạng mục là bắt buộc" },
        { status: 400 },
      );
    }

    // Tự động tạo mã hạng mục: HM-0001
    const count = await CategoryItem.countDocuments();
    const generatedCode = `HM-${String(count + 1).padStart(4, "0")}`;

    const categoryItem = new CategoryItem({
      groupId,
      name: name.trim(),
      code: generatedCode,
      note: note?.trim() || "",
    });

    await categoryItem.save();

    return NextResponse.json(
      {
        success: true,
        data: categoryItem,
        message: "Tạo hạng mục thành công",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating category item:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Mã hạng mục đã tồn tại" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Không thể tạo hạng mục" },
      { status: 500 },
    );
  }
}
