import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CustomerCare from "../../../models/CustomerCare";
import Customer from "../../../models/Customer";
import "../../../models/Opportunity"; // Import to register model
import "../../../models/ProjectSurvey"; // Import to register model
import "../../../models/Quotation"; // Import to register "BaoGia" model
import { verifyToken } from "../../../lib/auth";
import { getAssignedCustomerIds } from "../../../lib/permissions";
import mongoose from "mongoose";

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

    // Áp dụng phân quyền
    const assignedCustomerIds = await getAssignedCustomerIds(auth, Customer);
    if (assignedCustomerIds) {
      // Lấy danh sách customerId string để hỗ trợ dữ liệu cũ
      const customers = await Customer.find({
        _id: { $in: assignedCustomerIds },
      }).select("customerId");
      const customerIdStrings = customers.map((c) => c.customerId);

      query.$or = [
        { customerRef: { $in: assignedCustomerIds } },
        { "customerInfo._id": { $in: assignedCustomerIds } }, // Hỗ trợ query trên object nhúng mới
        { customerId: { $in: customerIdStrings } },
      ];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchConditions = [
        { careId: searchRegex },
        { carePerson: searchRegex },
        { location: searchRegex },
        { "customerInfo.shortName": searchRegex }, // Tìm trực tiếp trên tên khách hàng đã nhúng
        { customerId: searchRegex },
        { interestedServices: searchRegex },
      ];

      if (query.$or) {
        // Nếu đã có $or từ phân quyền, dùng $and để kết hợp
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
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
      CustomerCare.find(query)
        .populate("opportunityRef", "opportunityNo")
        .populate("surveyRef", "surveyNo status")
        .populate("quotationRef", "quotationNo status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Sử dụng lean() để trả về plain JS object, tăng tốc độ
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

    // 1. Tự động lấy shortName từ Customer để nhúng vào CustomerCare
    if (body.customerRef) {
      const customerDoc = await Customer.findById(body.customerRef).select(
        "shortName",
      );
      if (customerDoc) {
        body.customerInfo = {
          _id: customerDoc._id,
          shortName: customerDoc.shortName,
        };
      }
    }

    // 2. Tạo careId tự động nếu không có
    if (!body.careId) {
      const date = new Date();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      body.careId = `CSKH${month}${year}${random}`;
    }

    // 3. Làm sạch dữ liệu: Chuyển chuỗi rỗng sang null cho các trường Date và ObjectId
    if (body.timeFrom === "") body.timeFrom = null;
    if (body.timeTo === "") body.timeTo = null;
    if (body.actualCareDate === "") body.actualCareDate = null;
    if (body.quotationRef === "") body.quotationRef = null;
    if (body.surveyRef === "") body.surveyRef = null;
    if (body.opportunityRef === "") body.opportunityRef = null;
    if (body.customerRef === "") body.customerRef = null;

    const customerCare = new CustomerCare(body);
    await customerCare.save();

    // 4. Cập nhật lịch sử và nhu cầu vào Opportunity
    if (body.opportunityRef) {
      const Opportunity = (await import("../../../models/Opportunity")).default;

      const updateData: any = {
        $push: { careHistory: customerCare._id },
      };

      // Cập nhật lại toàn bộ demands theo interestedServices mới nhất
      // Vì UI đã load demands cũ vào interestedServices để user chỉnh sửa (thêm/bớt)
      // nên việc dùng $set sẽ chính xác hơn $addToSet
      if (body.interestedServices && Array.isArray(body.interestedServices)) {
        updateData.$set = { demands: body.interestedServices };
      }

      await Opportunity.findByIdAndUpdate(body.opportunityRef, updateData);
    }

    // 5. Cập nhật ngược lại cho Survey và Quotation nếu có
    if (body.surveyRef) {
      const ProjectSurvey = (await import("../../../models/ProjectSurvey"))
        .default;
      await ProjectSurvey.findByIdAndUpdate(body.surveyRef, {
        careRef: customerCare._id,
      });
    }

    if (body.quotationRef) {
      const Quotation = (await import("../../../models/Quotation")).default;
      await Quotation.findByIdAndUpdate(body.quotationRef, {
        careRef: customerCare._id,
      });
    }

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
