import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import ServicePackage from "../../../models/ServicePackage";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const active = searchParams.get("active");

    const query: any = {};
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ServicePackage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServicePackage.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching service packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service packages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Tự động tạo mã gói dịch vụ (PKG-XXXX)
    const lastPackage = await ServicePackage.findOne({}, { code: 1 }).sort({
      code: -1,
    });
    let newCode = "PKG-0001";

    if (
      lastPackage &&
      lastPackage.code &&
      lastPackage.code.startsWith("PKG-")
    ) {
      const currentNumber = parseInt(lastPackage.code.replace("PKG-", ""));
      if (!isNaN(currentNumber)) {
        newCode = `PKG-${(currentNumber + 1).toString().padStart(4, "0")}`;
      }
    } else if (lastPackage && lastPackage.code) {
      const count = await ServicePackage.countDocuments();
      newCode = `PKG-${(count + 1).toString().padStart(4, "0")}`;
    }

    const servicePackage = new ServicePackage({
      ...body,
      code: newCode,
    });
    await servicePackage.save();

    return NextResponse.json(
      {
        success: true,
        data: servicePackage,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating service package:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create service package",
      },
      { status: 500 },
    );
  }
}
