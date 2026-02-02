import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import ServicePricing from "../../../models/ServicePricing";
import Service from "../../../models/Service";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const serviceName = searchParams.get("serviceName");
    const serviceGroup = searchParams.get("serviceGroup");
    const packageName = searchParams.get("packageName");
    const search = searchParams.get("search");

    const query: any = {};

    // Service Group filter (requires lookup in Service collection)
    if (serviceGroup && serviceGroup !== "all") {
      const servicesInGroup = await Service.find({ serviceGroup }).select(
        "serviceName",
      );
      const serviceNames = servicesInGroup.map((s) => s.serviceName);
      query.serviceName = { $in: serviceNames };
    }

    // Status filter
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "used") {
      query.isUsed = true;
    }

    // Exact match filters
    if (serviceName && serviceName !== "all") {
      query.serviceName = serviceName;
    }
    if (packageName && packageName !== "all") {
      query.packageName = packageName;
    }

    // General search filter
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: "i" } },
        { packageName: { $regex: search, $options: "i" } },
      ];
    }

    // console.log("Service Pricing Query:", JSON.stringify(query, null, 2));

    // Debug: Lấy tất cả data để kiểm tra
    if (!serviceName && !packageName) {
      const allData = await ServicePricing.find({});
      // console.log("All Service Pricing Data:", allData);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ServicePricing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServicePricing.countDocuments(query),
    ]);

    console.log("Service Pricing Results:", {
      total,
      dataCount: data.length,
      // sampleData: data.slice(0, 2),
      Data: data,
    });

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
    console.error("Error fetching service pricing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service pricing" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const servicePricing = new ServicePricing(body);
    await servicePricing.save();

    return NextResponse.json(
      {
        success: true,
        data: servicePricing,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating service pricing:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Service pricing already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create service pricing" },
      { status: 500 },
    );
  }
}
