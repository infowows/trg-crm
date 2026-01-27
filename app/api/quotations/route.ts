import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Quotation from "../../../models/Quotation";
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
        const {
            quotationNo,
            customer,
            date,
            validTo,
            items,
            totalAmount,
            taxAmount,
            grandTotal,
        } = body;

        if (!quotationNo || !customer) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập số báo giá và tên khách hàng",
                },
                { status: 400 },
            );
        }

        // Check if quotation number already exists
        const existingQuotation = await Quotation.findOne({ quotationNo });
        if (existingQuotation) {
            return NextResponse.json(
                { success: false, message: "Số báo giá đã tồn tại" },
                { status: 400 },
            );
        }

        const quotation = new Quotation({
            quotationNo,
            customer,
            date: date ? new Date(date) : new Date(),
            validTo: validTo ? new Date(validTo) : null,
            items: items || [],
            totalAmount: totalAmount || 0,
            taxAmount: taxAmount || 0,
            grandTotal: grandTotal || 0,
            status: "draft",
            createdBy: auth.username,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await quotation.save();

        return NextResponse.json({
            success: true,
            message: "Thêm báo giá thành công",
            data: quotation,
        });
    } catch (error) {
        console.error("POST quotation error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
