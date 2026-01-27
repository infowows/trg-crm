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

        const query: any = {};
        if (active !== null && active !== undefined) {
            query.active = active === "true";
        }
        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Service.countDocuments(query),
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

        // Map frontend fields to database fields
        const serviceData = {
            serviceName: body.serviceName,
            code: body.code || generateServiceCode(body.serviceName),
            description: body.description,
            active: body.isActive,
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

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Code already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create service",
            },
            { status: 500 },
        );
    }
}

// Helper function to generate service code
function generateServiceCode(serviceName: string): string {
    return serviceName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .substring(0, 10);
}
