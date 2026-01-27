import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import SourceSetting from "../../../models/SourceSetting";
import CustomerClassification from "../../../models/CustomerClassification";
import CareType from "../../../models/CareType";
import Service from "../../../models/Service";
import ServicePackage from "../../../models/ServicePackage";
import CategoryItem from "../../../models/CategoryItem";
import Employee from "../../../models/Employee";
import Customer from "../../../models/Customer";
import CustomerCare from "../../../models/CustomerCare";
import MaterialGroup from "../../../models/MaterialGroup";
import ServicePricing from "../../../models/ServicePricing";

export async function POST() {
    try {
        await dbConnect();
        console.log("🔄 Starting seed data process...");

        // Seed Source Settings (Cai dat nguon)
        const sourceSettingsData = [
            { code: "SDF12", name: "Google Ads", active: true },
            { code: "SDF13", name: "Facebook", active: true },
            { code: "SDF14", name: "Sales tự tìm", active: true },
            { code: "SDF15", name: "BGĐ giao", active: true },
            { code: "SDF16", name: "CTV/ Referrals", active: true },
        ];

        const existingSourceSettings = await SourceSetting.countDocuments();
        if (existingSourceSettings === 0) {
            await SourceSetting.insertMany(sourceSettingsData);
            console.log("✅ Source settings seeded");
        }

        // Seed Customer Classifications (Phân loại KH)
        const customerClassificationsData = [
            {
                id: "SDF14",
                marketingClassification: "1. Phù Hợp",
                salesClassification: "1. Ngắn hạn",
                description: "Khách hàng phù hợp ngắn hạn",
            },
            {
                id: "SDF15",
                marketingClassification: "2. Rác",
                salesClassification: "2. Trung hạn",
                description: "Khách hàng rác, trung hạn",
            },
        ];

        const existingCustomerClassifications =
            await CustomerClassification.countDocuments();
        if (existingCustomerClassifications === 0) {
            await CustomerClassification.insertMany(
                customerClassificationsData,
            );
            console.log("✅ Customer classifications seeded");
        }

        // Seed Employees (DSNV)
        const employeesData = [
            {
                employeeId: "NV001",
                fullName: "Nguyễn Văn A",
                position: "Sales Manager",
                phone: "0912345678",
                email: "anv@company.com",
            },
            {
                employeeId: "NV002",
                fullName: "Trần Thị B",
                position: "Sales Executive",
                phone: "0923456789",
                email: "btt@company.com",
            },
            {
                employeeId: "NV003",
                fullName: "Lê Văn C",
                position: "Designer",
                phone: "0934567890",
                email: "clv@company.com",
            },
        ];

        const existingEmployees = await Employee.countDocuments();
        if (existingEmployees === 0) {
            await Employee.insertMany(employeesData);
            console.log("✅ Employees seeded");
        }

        // Seed Customers (DSKH)
        const customersData = [
            {
                customerId: "KH-0001",
                fullName: "Công ty ABC",
                shortName: "ABC",
                address: "123 Nguyễn Huệ, Q.1, TP.HCM",
                phone: "0281234567",
                source: "Google Ads",
                marketingClassification: "1. Phù Hợp",
                potentialLevel: "Cao",
                salesPerson: "Nguyễn Văn A",
            },
            {
                customerId: "KH-0002",
                fullName: "Công ty XYZ",
                shortName: "XYZ",
                address: "456 Lê Lợi, Q.1, TP.HCM",
                phone: "0282345678",
                source: "Facebook",
                marketingClassification: "2. Rác",
                potentialLevel: "Trung bình",
                salesPerson: "Trần Thị B",
            },
        ];

        const existingCustomers = await Customer.countDocuments();
        if (existingCustomers === 0) {
            await Customer.insertMany(customersData);
            console.log("✅ Customers seeded");
        }

        // Seed Service Pricing (Cai dat gia)
        const servicePricingData = [
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà cấp 4",
                package1: "Gói cơ bản",
                unitPrice: 500000,
            },
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà cấp 4 gác lửng",
                package1: "Gói tiêu chuẩn",
                unitPrice: 800000,
            },
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà phố",
                package2: "Gói cao cấp",
                unitPrice: 1200000,
            },
        ];

        const existingServicePricing = await ServicePricing.countDocuments();
        if (existingServicePricing === 0) {
            await ServicePricing.insertMany(servicePricingData);
            console.log("✅ Service pricing seeded");
        }

        // Seed Material Groups (Nhom vat tu)
        const materialGroupsData = [
            {
                groupId: "VT001",
                groupName: "Vật liệu xây dựng",
                description: "Gạch, xi măng, cát, đá",
            },
            {
                groupId: "VT002",
                groupName: "Vật liệu hoàn thiện",
                description: "Sơn, sàn, cửa",
            },
            {
                groupId: "VT003",
                groupName: "Thiết bị điện nước",
                description: "Điện, nước, điều hòa",
            },
        ];

        const existingMaterialGroups = await MaterialGroup.countDocuments();
        if (existingMaterialGroups === 0) {
            await MaterialGroup.insertMany(materialGroupsData);
            console.log("✅ Material groups seeded");
        }

        console.log("🎉 Seed data completed successfully!");

        return NextResponse.json({
            success: true,
            message: "Seed data completed successfully",
            data: {
                sourceSettings: sourceSettingsData.length,
                customerClassifications: customerClassificationsData.length,
                employees: employeesData.length,
                customers: customersData.length,
                servicePricing: servicePricingData.length,
                materialGroups: materialGroupsData.length,
            },
        });
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        return NextResponse.json(
            { success: false, error: "Failed to seed data" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        await dbConnect();

        const [
            sourceSettings,
            customerClassifications,
            employees,
            customers,
            servicePricing,
            materialGroups,
        ] = await Promise.all([
            SourceSetting.countDocuments(),
            CustomerClassification.countDocuments(),
            Employee.countDocuments(),
            Customer.countDocuments(),
            ServicePricing.countDocuments(),
            MaterialGroup.countDocuments(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                sourceSettings,
                customerClassifications,
                employees,
                customers,
                servicePricing,
                materialGroups,
            },
        });
    } catch (error) {
        console.error("❌ Error checking seed data:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check seed data" },
            { status: 500 },
        );
    }
}
