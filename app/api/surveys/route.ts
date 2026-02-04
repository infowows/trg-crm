import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProjectSurvey from "@/models/ProjectSurvey";
import Customer from "@/models/Customer";
import CustomerCare from "@/models/CustomerCare";
import { verifyToken } from "@/lib/auth";
import { getAssignedCustomerIds } from "@/lib/permissions";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

// GET - Lấy danh sách khảo sát
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
    const search = searchParams.get("search");
    const hasQuotation = searchParams.get("hasQuotation");

    const query: any = {};

    // Áp dụng phân quyền
    const assignedCustomerIds = await getAssignedCustomerIds(auth, Customer);
    if (assignedCustomerIds) {
      // Backup cho data cũ: lọc theo createdBy HOẶC customerRef nằm trong list được giao
      query.$or = [
        { customerRef: { $in: assignedCustomerIds } },
        { createdBy: auth.username },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { surveyNo: { $regex: search, $options: "i" } },
        { surveyAddress: { $regex: search, $options: "i" } },
        { "surveys.name": { $regex: search, $options: "i" } },
        { createdBy: { $regex: search, $options: "i" } },
      ];
    }

    if (hasQuotation !== null) {
      if (hasQuotation === "true") {
        query.quotationNo = { $ne: null };
      } else {
        query.quotationNo = null;
      }
    }

    const skip = (page - 1) * limit;

    const [surveys, total] = await Promise.all([
      ProjectSurvey.find(query)
        .populate("customerRef", "fullName customerId")
        .populate("careRef", "careId careType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProjectSurvey.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET surveys error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// POST - Thêm khảo sát mới
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
    const {
      surveys,
      surveyDate,
      surveyAddress,
      surveyNotes,
      customerRef,
      careRef,
    } = body;

    if (!customerRef && !careRef) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng chọn khách hàng hoặc lượt chăm sóc",
        },
        { status: 400 },
      );
    }

    if (!surveyDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập ngày khảo sát",
        },
        { status: 400 },
      );
    }

    if (!surveys || !Array.isArray(surveys) || surveys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập ít nhất một hạng mục khảo sát",
        },
        { status: 400 },
      );
    }

    // Validate surveys data
    for (const survey of surveys) {
      if (
        !survey.name ||
        !survey.unit ||
        survey.length === undefined ||
        survey.width === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Dữ liệu hạng mục không hợp lệ",
          },
          { status: 400 },
        );
      }
    }

    // 1. Xác định Customer và ShortName
    let finalCustomerRef = customerRef;
    let shortName = "KH";

    if (careRef) {
      const CustomerCare = (await import("@/models/CustomerCare")).default;
      const care = await CustomerCare.findById(careRef).select(
        "customerRef customerInfo",
      );
      if (care) {
        finalCustomerRef = care.customerRef;
        if (care.customerInfo && care.customerInfo.shortName) {
          shortName = care.customerInfo.shortName;
        }
      }
    }

    // Nếu chưa có shortName (do không có careRef hoặc careRef không có info), lấy từ Customer
    if (finalCustomerRef && shortName === "KH") {
      const customer =
        await Customer.findById(finalCustomerRef).select("shortName");
      if (customer && customer.shortName) {
        shortName = customer.shortName;
      }
    }

    if (!finalCustomerRef) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Không xác định được khách hàng. Vui lòng chọn Khách hàng hoặc Kế hoạch CSKH.",
        },
        { status: 400 },
      );
    }

    // 2. Tạo số khảo sát tự động: KS-{shortName}-{yymmdd}
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    let baseSurveyNo = `KS-${shortName}-${dateStr}`;
    let surveyNo = baseSurveyNo;
    let counter = 1;

    // Kiểm tra trùng lặp và thêm hậu tố nếu cần
    while (await ProjectSurvey.exists({ surveyNo })) {
      surveyNo = `${baseSurveyNo}-${counter}`;
      counter++;
    }

    const survey = new ProjectSurvey({
      surveyNo,
      surveys,
      quotationNo: null,
      status: "draft",
      surveyDate: new Date(surveyDate),
      surveyAddress,
      surveyNotes,
      customerRef: finalCustomerRef,
      careRef,
      createdBy: auth.username,
    });

    await survey.save();

    // Cập nhật ngược lại cho CustomerCare nếu có careRef
    if (careRef) {
      const CustomerCare = (await import("@/models/CustomerCare")).default;
      await CustomerCare.findByIdAndUpdate(careRef, {
        surveyRef: survey._id,
        surveyNo: survey.surveyNo,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thêm khảo sát thành công",
      data: survey,
    });
  } catch (error: any) {
    console.error("POST survey error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Số khảo sát đã tồn tại" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
