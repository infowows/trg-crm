import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import ServicePricing from "../../../../models/ServicePricing";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;

        const pricing = await ServicePricing.findById(id);

        if (!pricing) {
            return NextResponse.json(
                { success: false, error: "Service pricing not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: pricing,
        });
    } catch (error) {
        console.error("Error fetching service pricing:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch service pricing" },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const updatedPricing = await ServicePricing.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true },
        );

        if (!updatedPricing) {
            return NextResponse.json(
                { success: false, error: "Service pricing not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service pricing updated successfully",
            data: updatedPricing,
        });
    } catch (error: any) {
        console.error("Error updating service pricing:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Service pricing already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to update service pricing" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;

        const deletedPricing = await ServicePricing.findByIdAndDelete(id);

        if (!deletedPricing) {
            return NextResponse.json(
                { success: false, error: "Service pricing not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service pricing deleted successfully",
            data: deletedPricing,
        });
    } catch (error) {
        console.error("Error deleting service pricing:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete service pricing" },
            { status: 500 },
        );
    }
}
