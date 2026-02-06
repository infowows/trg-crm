import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Opportunity from "../../../models/Opportunity";
import Customer from "../../../models/Customer";
import { verifyToken } from "../../../lib/auth";
import { getAssignedCustomerIds } from "../../../lib/permissions";
import mongoose from "mongoose";

async function verifyAuth(request: NextRequest) {
  // Ưu tiên lấy token từ Authorization header
  const authHeader = request.headers.get("Authorization");
  let token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  // Nếu không có trong header, thử lấy từ cookie
  if (!token) {
    token = request.cookies.get("token")?.value || null;
  }

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
    if (status && status !== "all") {
      if (status === "Open") {
        // "Open" nghĩa là các trạng thái chưa kết thúc
        query.status = { $nin: ["Thành công", "Không thành công"] };
      } else {
        query.status = status;
      }
    }

    // Áp dụng phân quyền
    const assignedCustomerIds = await getAssignedCustomerIds(auth, Customer);
    if (assignedCustomerIds) {
      if (customerId) {
        // Nếu có customerId trong filter, kiểm tra xem có thuộc quyền quản lý không
        if (
          assignedCustomerIds.some((id: any) => id.toString() === customerId)
        ) {
          query.customerRef = customerId;
        } else {
          // Nếu không thuộc quyền quản lý, trả về rỗng hoặc lỗi
          query.customerRef = new mongoose.Types.ObjectId(); // Query không khớp gì cả
        }
      } else {
        query.customerRef = { $in: assignedCustomerIds };
      }
    } else if (customerId) {
      query.customerRef = customerId;
    }

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate({
          path: "customerRef",
          select: "fullName customerId assignedTo",
          populate: {
            path: "assignedTo",
            select: "fullName",
          },
        })
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

    // Fetch customer to get shortName
    const customer = await Customer.findById(body.customerRef);
    const shortName = (customer?.shortName || "KH").toUpperCase();

    // Generate opportunityNo: OP-[ShortName]-[yymmdd]
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    const baseNo = `OP-${shortName}-${dateStr}`;
    let opportunityNo = baseNo;

    // Check for uniqueness and add sequence if necessary
    const existingCount = await Opportunity.countDocuments({
      opportunityNo: { $regex: new RegExp(`^${baseNo}(-.+)?$`) },
    });

    if (existingCount > 0) {
      opportunityNo = `${baseNo}-${String(existingCount + 1).padStart(2, "0")}`;
    }

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
