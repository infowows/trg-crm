import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import CareType from "../../../models/CareType";

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
            CareType.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CareType.countDocuments(query),
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
        console.error("Error fetching care types:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch care types" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const careType = new CareType(body);
        await careType.save();

        return NextResponse.json(
            {
                success: true,
                data: careType,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("Error creating care type:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Care type code already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to create care type" },
            { status: 500 },
        );
    }
}
