import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CustomerCare from "../../../models/CustomerCare";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const customerId = searchParams.get("customerId");
        const careType = searchParams.get("careType");

        const query: any = {};
        if (status) {
            query.status = status;
        }
        if (customerId) {
            query.customerId = customerId;
        }
        if (careType) {
            query.careType = { $regex: careType, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            CustomerCare.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CustomerCare.countDocuments(query),
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
        console.error("Error fetching customer care records:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch customer care records" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const customerCare = new CustomerCare(body);
        await customerCare.save();

        return NextResponse.json(
            {
                success: true,
                data: customerCare,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("Error creating customer care record:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Care ID already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to create customer care record" },
            { status: 500 },
        );
    }
}
