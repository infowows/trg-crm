import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CategoryItem from "../../../models/CategoryItem";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

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

        const [data, total] = await Promise.all([
            CategoryItem.find(query)
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
        const { name, code, note } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: "Tên và mã hạng mục là bắt buộc" },
                { status: 400 },
            );
        }

        // Check if code already exists
        const existingItem = await CategoryItem.findOne({
            code: code.toUpperCase(),
        });
        if (existingItem) {
            return NextResponse.json(
                { success: false, error: "Mã hạng mục đã tồn tại" },
                { status: 400 },
            );
        }

        const categoryItem = new CategoryItem({
            name: name.trim(),
            code: code.toUpperCase().trim(),
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
