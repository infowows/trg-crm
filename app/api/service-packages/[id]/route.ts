import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import ServicePackage from "../../../../models/ServicePackage";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const updatedPackage = await ServicePackage.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true },
        );

        if (!updatedPackage) {
            return NextResponse.json(
                { success: false, error: "Service package not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service package updated successfully",
            data: updatedPackage,
        });
    } catch (error: any) {
        console.error("Error updating service package:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Package code already exists" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, error: "Failed to update service package" },
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

        const deletedPackage = await ServicePackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            return NextResponse.json(
                { success: false, error: "Service package not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service package deleted successfully",
            data: deletedPackage,
        });
    } catch (error) {
        console.error("Error deleting service package:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete service package" },
            { status: 500 },
        );
    }
}
