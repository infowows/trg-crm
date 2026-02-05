import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Service from "../../../models/Service";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const active = searchParams.get("active");
    const category = searchParams.get("category");

    console.log("API Services - Query params:", {
      page,
      limit,
      active,
      category,
    });

    const query: any = {};
    if (active !== null && active !== undefined) {
      query.isActive = active === "true";
    }
    if (category) {
      query.serviceGroup = category;
    }

    console.log("API Services - MongoDB query:", query);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Service.countDocuments(query),
    ]);

    console.log("API Services - Found services:", data.length);

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
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Tự động tạo mã dịch vụ (SVC-XXXX)
    const lastService = await Service.findOne({}, { code: 1 }).sort({
      code: -1,
    });
    let newCode = "SVC-0001";

    if (
      lastService &&
      lastService.code &&
      lastService.code.startsWith("SVC-")
    ) {
      const currentNumber = parseInt(lastService.code.replace("SVC-", ""));
      if (!isNaN(currentNumber)) {
        newCode = `SVC-${(currentNumber + 1).toString().padStart(4, "0")}`;
      }
    } else if (lastService && lastService.code) {
      const count = await Service.countDocuments();
      newCode = `SVC-${(count + 1).toString().padStart(4, "0")}`;
    }

    // Map frontend fields to database fields
    const serviceData = {
      serviceName: body.serviceName,
      code: newCode,
      serviceGroup: body.serviceGroup,
      description: body.description,
      isActive: body.isActive,
    };

    const service = new Service(serviceData);
    await service.save();

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating service:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create service",
      },
      { status: 500 },
    );
  }
}
