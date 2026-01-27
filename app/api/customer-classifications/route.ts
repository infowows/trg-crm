import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CustomerClassification from "../../../models/CustomerClassification";

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
            CustomerClassification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CustomerClassification.countDocuments(query),
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
        console.error("Error fetching customer classifications:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch customer classifications",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const classification = new CustomerClassification(body);
        await classification.save();

        return NextResponse.json(
            {
                success: true,
                data: classification,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("Error creating customer classification:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Classification ID already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create customer classification",
            },
            { status: 500 },
        );
    }
}
