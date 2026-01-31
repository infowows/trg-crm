import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CustomerCare from "../../../models/CustomerCare";
import { verifyToken } from "../../../lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const careType = searchParams.get("careType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { careId: searchRegex },
        { carePerson: searchRegex },
        { location: searchRegex },
        { customerId: searchRegex }, // Tìm theo mã khách hàng nếu cần
        { interestedServices: searchRegex },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (careType && careType !== "all") {
      query.careType = careType;
    }

    if (startDate || endDate) {
      query.timeFrom = {};
      if (startDate) query.timeFrom.$gte = new Date(startDate);
      if (endDate) query.timeFrom.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CustomerCare.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CustomerCare.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customer care records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer care records" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();
    const body = await request.json();

    // Generate careId if not provided
    if (!body.careId) {
      const date = new Date();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      body.careId = `CSKH${month}${year}${random}`;
    }

    const customerCare = new CustomerCare(body);
    await customerCare.save();

    return NextResponse.json(
      {
        success: true,
        message: "Tạo kế hoạch CSKH thành công",
        data: customerCare,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating customer care record:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Mã CSKH đã tồn tại" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Không thể tạo kế hoạch CSKH" },
      { status: 500 },
    );
  }
}
