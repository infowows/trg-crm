import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Quotation from "../../../models/Quotation";
import ProjectSurvey from "../../../models/ProjectSurvey";
import Customer from "../../../models/Customer";
import CustomerCare from "../../../models/CustomerCare";
import Opportunity from "../../../models/Opportunity";
import ServicePricing from "../../../models/ServicePricing";
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

// GET - Lấy danh sách báo giá
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
    await mongoose.connection.db;

    // Force registration of models
    await import("../../../models/CustomerCare");
    await import("../../../models/ProjectSurvey");
    await import("../../../models/ServicePricing");
    await import("../../../models/Customer");
    await import("../../../models/Quotation");
    await import("../../../models/Opportunity");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};

    // Áp dụng phân quyền
    const assignedCustomerIds = await getAssignedCustomerIds(auth, Customer);
    if (assignedCustomerIds) {
      query.customerRef = { $in: assignedCustomerIds };
    }

    if (search) {
      const searchConditions = [
        { quotationNo: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
      ];

      if (query.customerRef) {
        query.$and = [
          { customerRef: query.customerRef },
          { $or: searchConditions },
        ];
        delete query.customerRef;
      } else {
        query.$or = searchConditions;
      }
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    console.log("Querying quotations with populate..."); // Force reload and debug

    // Build base query for status counts (without status filter)
    const baseQuery: any = {};
    if (assignedCustomerIds) {
      baseQuery.customerRef = { $in: assignedCustomerIds };
    }
    if (search) {
      const searchConditions = [
        { quotationNo: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
      ];
      if (baseQuery.customerRef) {
        baseQuery.$and = [
          { customerRef: baseQuery.customerRef },
          { $or: searchConditions },
        ];
        delete baseQuery.customerRef;
      } else {
        baseQuery.$or = searchConditions;
      }
    }

    const [quotations, total, statusCounts] = await Promise.all([
      Quotation.find(query)
        .populate("customerRef", "fullName customerId")
        .populate("surveyRef", "surveyNo status")
        .populate("careRef", "careId careType")
        .populate("opportunityRef", "opportunityNo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quotation.countDocuments(query),
      // Count by status
      Promise.all([
        Quotation.countDocuments(baseQuery), // all
        Quotation.countDocuments({ ...baseQuery, status: "draft" }),
        Quotation.countDocuments({ ...baseQuery, status: "sent" }),
        Quotation.countDocuments({ ...baseQuery, status: "approved" }),
        Quotation.countDocuments({ ...baseQuery, status: "rejected" }),
        Quotation.countDocuments({ ...baseQuery, status: "completed" }),
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: quotations,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      statusCounts: {
        all: statusCounts[0],
        draft: statusCounts[1],
        sent: statusCounts[2],
        approved: statusCounts[3],
        rejected: statusCounts[4],
        completed: statusCounts[5],
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET quotations error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// POST - Thêm báo giá mới
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
    await mongoose.connection.db;

    const body = await request.json();
    const {
      customer,
      customerRef,
      surveyRef,
      careRef,
      opportunityRef,
      date,
      packages,
      notes,
    } = body;

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập tên khách hàng",
        },
        { status: 400 },
      );
    }

    // Tạo số báo giá tự động
    const lastQuotation = await Quotation.findOne().sort({ createdAt: -1 });
    let quotationNo = "BG001";

    if (lastQuotation && lastQuotation.quotationNo) {
      const lastNumber = parseInt(lastQuotation.quotationNo.replace("BG", ""));
      quotationNo = `BG${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // console.log("=== CREATING QUOTATION ===");
    // console.log("Request body:", body);
    // console.log("Packages:", packages);

    // Tính toán totalAmount và grandTotal manual
    let totalAmount = 0;
    const processedPackages =
      packages?.map((service: any) => {
        const processedService = {
          ...service,
          packages: service.packages.map((pkg: any) => {
            const totalPrice = service.volume * pkg.servicePricing;
            totalAmount += totalPrice;
            return {
              ...pkg,
              totalPrice,
            };
          }),
        };
        return processedService;
      }) || [];

    // console.log("Processed packages:", processedPackages);
    // console.log("Calculated totalAmount:", totalAmount);

    const quotation = new Quotation({
      quotationNo,
      customer,
      customerRef: customerRef || undefined,
      surveyRef: surveyRef || undefined,
      careRef: careRef || undefined,
      opportunityRef: opportunityRef || undefined,
      date: date ? new Date(date) : new Date(),
      packages: processedPackages,
      totalAmount,
      grandTotal: totalAmount, // GrandTotal = totalAmount (không có thuế)
      status: "draft",
      notes,
      createdBy: auth.username,
    });

    // console.log("Quotation object before save:", quotation);
    // console.log("Quotation packages before save:", quotation.packages);

    await quotation.save();

    // Cập nhật isUsed = true cho các service pricing đã sử dụng
    const ServicePricingModel = ServicePricing;
    if (ServicePricingModel && packages && packages.length > 0) {
      const pricingIds: string[] = [];

      // Lấy tất cả pricing IDs từ packages
      packages.forEach((service: any) => {
        service.packages.forEach((pkg: any) => {
          if (pkg._id) {
            pricingIds.push(pkg._id.toString());
          }
        });
      });

      // Cập nhật isUsed = true cho các pricing đã sử dụng
      if (pricingIds.length > 0) {
        await ServicePricingModel.updateMany(
          { _id: { $in: pricingIds } },
          { isUsed: true },
        );
      }
    }

    // Nếu có surveyRef, cập nhật quotationNo trong survey
    if (surveyRef) {
      const ProjectSurveyModel = ProjectSurvey;
      if (ProjectSurveyModel) {
        await ProjectSurveyModel.findByIdAndUpdate(surveyRef, {
          quotationNo,
          status: "quoted",
          updatedAt: new Date(),
        });
      }
    }

    // Nếu có careRef, cập nhật quotationRef trong CustomerCare
    if (careRef) {
      const CustomerCareModel = CustomerCare;
      if (CustomerCareModel) {
        await CustomerCareModel.findByIdAndUpdate(careRef, {
          quotationRef: quotation._id,
          quotationNo: quotation.quotationNo,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thêm báo giá thành công",
      data: quotation,
    });
  } catch (error: any) {
    console.error("POST quotation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Số báo giá đã tồn tại" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
