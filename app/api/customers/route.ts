import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Customer from "../../../models/Customer";
import { verifyToken } from "../../../lib/auth";
import mongoose from "mongoose";
// import image from "next/image";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy danh sách khách hàng
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
        const search = searchParams.get("search") || "";
        const isActive = searchParams.get("isActive");
        const potentialLevel = searchParams.get("potentialLevel");
        const source = searchParams.get("source");

        const query: any = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { shortName: { $regex: search, $options: "i" } },
                { customerId: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
            ];
        }

        if (isActive !== null && isActive !== undefined && isActive !== "all") {
            query.isActive = isActive === "true";
        }

        if (potentialLevel && potentialLevel !== "all") {
            query.potentialLevel = potentialLevel;
        }

        if (source && source !== "all") {
            query.source = source;
        }

        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            Customer.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Customer.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET customers error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// POST - Thêm khách hàng mới
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
            fullName,
            shortName,
            address,
            phone,
            image,
            source,
            referrer,
            referrerPhone,
            serviceGroup,
            marketingClassification,
            potentialLevel,
            salesPerson,
            needsNote,
            isActive,
            lat,
            lng,
        } = body;

        if (!fullName || fullName.trim() === "") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập tên đầy đủ của khách hàng",
                },
                { status: 400 },
            );
        }

        // Generate unique customerId
        const generateCustomerId = async () => {
            const prefix = "KH";

            // Create shortName part (remove spaces and special chars, uppercase)
            const shortNamePart = shortName
                ? shortName
                      .trim()
                      .replace(/[^a-zA-Z0-9]/g, "") // Remove special characters
                      .toUpperCase()
                      .substring(0, 10) // Limit to 10 characters
                : "UNKNOWN";

            // Get the count of customers with this shortName
            const count = await Customer.countDocuments({
                customerId: { $regex: `^${prefix}${shortNamePart}-` },
            });

            const sequence = String(count + 1).padStart(4, "0");
            return `${prefix}${shortNamePart}-${sequence}`;
        };

        const customerId = await generateCustomerId();

        // Check if phone already exists
        if (phone && phone.trim() !== "") {
            const existingCustomer = await Customer.findOne({
                phone: phone.trim(),
            });
            if (existingCustomer) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Số điện thoại này đã được sử dụng",
                    },
                    { status: 400 },
                );
            }
        }

        // // Check if email already exists
        // if (email && email.trim() !== "") {
        //     const existingCustomer = await Customer.findOne({
        //         email: email.trim(),
        //     });
        //     if (existingCustomer) {
        //         return NextResponse.json(
        //             { success: false, message: "Email này đã được sử dụng" },
        //             { status: 400 },
        //         );
        //     }
        // }

        const customer = new Customer({
            customerId,
            fullName: fullName.trim(),
            shortName: shortName?.trim() || undefined,
            address: address?.trim() || undefined,
            phone: phone?.trim() || undefined,
            image: image?.trim() || undefined,
            source: source?.trim() || undefined,
            referrer: referrer?.trim() || undefined,
            referrerPhone: referrerPhone?.trim() || undefined,
            serviceGroup: serviceGroup?.trim() || undefined,
            marketingClassification:
                marketingClassification?.trim() || undefined,
            potentialLevel: potentialLevel?.trim() || undefined,
            salesPerson: salesPerson?.trim() || undefined,
            needsNote: needsNote?.trim() || undefined,
            isActive: isActive !== undefined ? isActive : true,
            latitude: lat !== undefined ? lat : undefined,
            longitude: lng !== undefined ? lng : undefined,
            registrationDate: new Date(),
        });

        await customer.save();

        return NextResponse.json({
            success: true,
            message: "Tạo khách hàng mới thành công",
            data: customer,
        });
    } catch (error) {
        console.error("POST customer error:", error);

        // Handle duplicate key error
        if (error instanceof Error && error.message.includes("duplicate key")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Mã khách hàng đã tồn tại. Vui lòng thử lại.",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
