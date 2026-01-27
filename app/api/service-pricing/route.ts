import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import ServicePricing from "../../../models/ServicePricing";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const active = searchParams.get("active");
        const serviceGroup = searchParams.get("serviceGroup");

        const query: any = {};
        if (active !== null && active !== undefined) {
            query.active = active === "true";
        }
        if (serviceGroup) {
            query.serviceGroup = { $regex: serviceGroup, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            ServicePricing.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ServicePricing.countDocuments(query),
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
