import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Quotation from "../../../models/Quotation";
import ProjectSurvey from "../../../models/ProjectSurvey";
import { verifyToken } from "../../../lib/auth";
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";

        const query: any = {};

        if (search) {
            query.$or = [
                { quotationNo: { $regex: search, $options: "i" } },
                { customer: { $regex: search, $options: "i" } },
            ];
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [quotations, total] = await Promise.all([
            Quotation.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Quotation.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: quotations,
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
        const { customer, customerRef, surveyRef, date, packages, notes } =
            body;

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
            const lastNumber = parseInt(
                lastQuotation.quotationNo.replace("BG", ""),
            );
            quotationNo = `BG${String(lastNumber + 1).padStart(3, "0")}`;
        }

        console.log("=== CREATING QUOTATION ===");
        console.log("Request body:", body);
        console.log("Packages:", packages);

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

        console.log("Processed packages:", processedPackages);
        console.log("Calculated totalAmount:", totalAmount);

        const quotation = new Quotation({
            quotationNo,
            customer,
            customerRef,
            surveyRef,
            date: date ? new Date(date) : new Date(),
            packages: processedPackages,
            totalAmount,
            grandTotal: totalAmount, // GrandTotal = totalAmount (không có thuế)
            status: "draft",
            notes,
            createdBy: auth.username,
        });

        console.log("Quotation object before save:", quotation);
        console.log("Quotation packages before save:", quotation.packages);

        await quotation.save();

        // Cập nhật isUsed = true cho các service pricing đã sử dụng
        const ServicePricing = mongoose.models.ServicePricing;
        if (ServicePricing && packages && packages.length > 0) {
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
                await ServicePricing.updateMany(
                    { _id: { $in: pricingIds } },
                    { isUsed: true },
                );
            }
        }

        // Nếu có surveyRef, cập nhật quotationNo trong survey
        if (surveyRef) {
            const ProjectSurvey = mongoose.models.PROJECT_SURVEY;
            if (ProjectSurvey) {
                await ProjectSurvey.findByIdAndUpdate(surveyRef, {
                    quotationNo,
                    status: "quoted",
                    updatedAt: new Date(),
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
