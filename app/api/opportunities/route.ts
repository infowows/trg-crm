import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Opportunity from "../../../models/Opportunity";
import { verifyToken } from "../../../lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

// GET - Lấy danh sách cơ hội
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
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (customerId) query.customerRef = customerId;

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate("customerRef", "fullName customerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Opportunity.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET opportunities error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// POST - Tạo cơ hội mới
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

    // Generate opportunityNo: OPP-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await Opportunity.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    const opportunityNo = `OPP-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    const opportunity = new Opportunity({
      ...body,
      opportunityNo,
      createdBy: auth.id || auth.username || "System",
    });

    await opportunity.save();

    return NextResponse.json({
      success: true,
      message: "Tạo cơ hội thành công",
      data: opportunity,
    });
  } catch (error) {
    console.error("POST opportunity error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
