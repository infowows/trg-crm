import { NextRequest, NextResponse } from "next/server";
import ServicePricing from "@/models/ServicePricing";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceName = searchParams.get("serviceName");
        const packageName = searchParams.get("packageName");
        const excludeId = searchParams.get("excludeId"); // Dùng cho edit

        if (!serviceName || !packageName) {
            return NextResponse.json(
                { success: false, message: "Thiếu tham số bắt buộc" },
                { status: 400 }
            );
        }

        // Tìm pricing trùng lặp
        const query: any = {
            serviceName,
            packageName,
            isActive: true
        };

        // Nếu là edit, loại bỏ record hiện tại
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingPricing = await ServicePricing.findOne(query).sort({ effectiveFrom: -1 });

        if (existingPricing) {
            return NextResponse.json({
                success: true,
                exists: true,
                existingPricing: {
                    _id: existingPricing._id,
                    serviceName: existingPricing.serviceName,
                    packageName: existingPricing.packageName,
                    effectiveFrom: existingPricing.effectiveFrom,
                    effectiveTo: existingPricing.effectiveTo,
                    unitPrice: existingPricing.unitPrice
                }
            });
        }

        return NextResponse.json({
            success: true,
            exists: false
        });

    } catch (error: any) {
        console.error("Error checking duplicate pricing:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}
