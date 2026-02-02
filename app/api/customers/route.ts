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

    const query: any = { isDel: { $ne: true } };

    if (search) {
      query.$and = [
        { isDel: { $ne: true } },
        {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { shortName: { $regex: search, $options: "i" } },
            { customerId: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        },
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
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
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

      // Helper function to remove Vietnamese tones and get initials for shortName
      const getInitials = (name: string) => {
        const parts = name
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .split(/\s+/);
        if (parts.length === 0) return "UNKNOWN";
        const lastName = parts.pop() || "";
        const firstInitials = parts.map((p) => p.charAt(0)).join("");
        return (lastName + firstInitials).toUpperCase();
      };

      const finalShortNamePart = shortName
        ? shortName
            .trim()
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
        : getInitials(fullName);

      // Tìm mã khách hàng lớn nhất có cùng shortNamePart để tăng số
      // Format: KH-SHORTNAME-XXXX
      const regex = new RegExp(`^${prefix}-${finalShortNamePart}-\\d{4}$`);
      const latestCustomer = await Customer.findOne({
        customerId: { $regex: regex },
      })
        .sort({ customerId: -1 })
        .select("customerId");

      let nextSequence = 1;
      if (latestCustomer && latestCustomer.customerId) {
        const parts = latestCustomer.customerId.split("-");
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
          nextSequence = lastNum + 1;
        }
      }

      const sequence = String(nextSequence).padStart(4, "0");
      return `${prefix}-${finalShortNamePart}-${sequence}`;
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
      marketingClassification: marketingClassification?.trim() || undefined,
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
