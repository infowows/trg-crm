import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Customer from "../../../models/Customer";
import Employee from "../../../models/Employee";
import Quotation from "../../../models/Quotation";
import CustomerCare from "../../../models/CustomerCare";
import Service from "../../../models/Service";
import SourceSetting from "../../../models/SourceSetting";

export async function GET() {
    try {
        await dbConnect();
        console.log("🔄 Fetching dashboard stats...");

        // Get counts for all collections
        const [
            customers,
            employees,
            quotations,
            customerCare,
            services,
            sourceSettings,
        ] = await Promise.all([
            Customer.countDocuments(),
            Employee.countDocuments(),
            Quotation.countDocuments(),
            CustomerCare.countDocuments(),
            Service.countDocuments(),
            SourceSetting.countDocuments(),
        ]);

        console.log("✅ Dashboard stats fetched successfully");

        return NextResponse.json({
            success: true,
            data: {
                customers,
                employees,
                quotations,
                customerCare,
                services,
                sourceSettings,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch dashboard stats" },
            { status: 500 },
        );
    }
}
